package com.tanya.cinepass.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name="show_seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShowSeat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; //table

    @ManyToOne
    @JoinColumn(name = "show_id",nullable = false)
    private Show show;

    @ManyToOne
    @JoinColumn(name = "seat_id",nullable = false)
    private Seat seat;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private Double price;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    // Timestamp set when a seat transitions to LOCKED.
    // The scheduler compares this to "now" to find seats whose 5-minute hold has expired.
    private LocalDateTime lockedAt;

    // Optimistic-locking version column. Hibernate auto-increments this on every UPDATE
    // and checks it hasn't changed since the row was read; if two transactions try to
    // update the same seat at once, the second one fails fast instead of silently
    // overwriting the first -- this is a second, complementary safety net on top of the
    // pessimistic row lock used in BookingService.
    @Version
    private Long version;

}
