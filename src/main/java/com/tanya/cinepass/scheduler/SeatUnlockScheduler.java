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


@Component
@RequiredArgsConstructor
public class SeatUnlockScheduler {

    private final ShowSeatRepository showSeatRepository;

    private final BookingRepository bookingRepository;

    @Value("${booking.lock.duration.minutes}")
    private int lockDurationMinutes;


    @Scheduled(fixedRate = 60000)
    @Transactional
    public void releaseExpiredSeatLocks()
    {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(lockDurationMinutes);

        List<ShowSeat> expiredSeats = showSeatRepository.findByStatusAndLockedAtBefore("LOCKED", cutoff);

        if (expiredSeats.isEmpty())
        {
            return;
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
