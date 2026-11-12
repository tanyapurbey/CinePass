package com.tanya.cinepass.repository;

import com.tanya.cinepass.model.ShowSeat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowSeatRepository extends JpaRepository<ShowSeat,Long>
{
    List<ShowSeat> findByShowId(Long movieId);

    List<ShowSeat> findByShowIdAndStatus(Long showId,String status);

    // Replaces the old "load every ShowSeat row, then filter in Java" pattern that used
    // to live in BookingService -- this pushes the filtering down to the database, which
    // is both faster and correct at any table size.
    List<ShowSeat> findByBookingId(Long bookingId);

    // Used by the scheduler: any seat still LOCKED whose lock timestamp is older than
    // the cutoff (now - 5 minutes) has expired and must be released back to AVAILABLE.
    List<ShowSeat> findByStatusAndLockedAtBefore(String status, LocalDateTime cutoff);

    // PESSIMISTIC_WRITE tells Hibernate to issue "SELECT ... FOR UPDATE" for these rows.
    // The database itself locks the rows until the current transaction commits or rolls
    // back, so if two users try to book the same seat at the same instant, the second
    // transaction physically waits at the database level until the first one finishes --
    // it will then see the updated (LOCKED/BOOKED) status and correctly fail instead of
    // both requests succeeding. This is the core fix for the double-booking race condition.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from ShowSeat s where s.id in :ids")
    List<ShowSeat> findAllByIdForUpdate(@Param("ids") List<Long> ids);
}

