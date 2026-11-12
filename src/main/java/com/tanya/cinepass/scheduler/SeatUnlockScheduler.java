package com.tanya.cinepass.scheduler;

import lombok.RequiredArgsConstructor;

import com.tanya.cinepass.model.Booking;
import com.tanya.cinepass.model.ShowSeat;
import com.tanya.cinepass.repository.BookingRepository;
import com.tanya.cinepass.repository.ShowSeatRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @Component registers this class as a Spring bean so its @Scheduled method is picked
 * up and invoked automatically by Spring's TaskScheduler -- no one calls this class
 * directly; Spring's scheduling infrastructure calls it on a timer in the background.
 *
 * For @Scheduled to work at all, scheduling must be turned on somewhere in the app with
 * @EnableScheduling (added to CinePassApplication).
 */
@Component
@RequiredArgsConstructor
public class SeatUnlockScheduler {

    private final ShowSeatRepository showSeatRepository;

    private final BookingRepository bookingRepository;

    @Value("${booking.lock.duration.minutes}")
    private int lockDurationMinutes;

    /**
     * fixedRate = 60000 means: start a new execution of this method every 60,000ms
     * (1 minute), measured from the start of the previous execution. This is the
     * "every minute" scheduled job requested: find expired locked seats and free them.
     *
     * @Transactional here matters just as much as in the service layer: releasing seats
     * and expiring their booking must succeed or fail together, or you'd end up with a
     * booking marked EXPIRED while its seats are still stuck as LOCKED forever (or vice versa).
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void releaseExpiredSeatLocks()
    {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(lockDurationMinutes);

        List<ShowSeat> expiredSeats = showSeatRepository.findByStatusAndLockedAtBefore("LOCKED", cutoff);

        if (expiredSeats.isEmpty())
        {
            return; // nothing to do this minute
        }

        Set<Long> affectedBookingIds = new HashSet<>();

        for (ShowSeat seat : expiredSeats)
        {
            if (seat.getBooking() != null)
            {
                affectedBookingIds.add(seat.getBooking().getId());
            }
            seat.setStatus("AVAILABLE");
            seat.setLockedAt(null);
            seat.setBooking(null);
        }
        showSeatRepository.saveAll(expiredSeats);

        // Any booking that was still PENDING when its seats got swept up here never
        // received payment in time -- mark it EXPIRED so it's not left dangling as
        // PENDING forever, and so getBookingByUserId/getBookingById reflect reality.
        for (Long bookingId : affectedBookingIds)
        {
            bookingRepository.findById(bookingId).ifPresent(booking -> {
                if ("PENDING".equals(booking.getStatus()))
                {
                    booking.setStatus("EXPIRED");
                    bookingRepository.save(booking);
                }
            });
        }
    }
}

