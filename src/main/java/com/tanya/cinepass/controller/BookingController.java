package com.tanya.cinepass.controller;

import lombok.RequiredArgsConstructor;

import com.tanya.cinepass.dto.BookingDto;
import com.tanya.cinepass.dto.BookingRequestDto;
import com.tanya.cinepass.dto.PaymentRequestDto;
import com.tanya.cinepass.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * Legacy one-shot endpoint: locks seats AND takes payment in a single call.
     * Kept for backward compatibility. New clients should prefer /lock followed
     * by /{id}/confirm-payment, which gives the user time to actually pay.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BookingDto> createBooking(@Valid @RequestBody BookingRequestDto bookingRequest)
    {
        return new ResponseEntity<>(bookingService.createBooking(bookingRequest), HttpStatus.CREATED);
    }

    /** Step 1 of the smart seat-locking flow: reserve seats, start the 5-minute timer. */
    @PostMapping("/lock")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BookingDto> lockSeats(@Valid @RequestBody BookingRequestDto bookingRequest)
    {
        return new ResponseEntity<>(bookingService.lockSeats(bookingRequest), HttpStatus.CREATED);
    }

    /** Step 2 of the smart seat-locking flow: pay for a still-locked booking to confirm it. */
    @PostMapping("/{id}/confirm-payment")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BookingDto> confirmPayment(@PathVariable Long id, @Valid @RequestBody PaymentRequestDto paymentRequest)
    {
        return ResponseEntity.ok(bookingService.confirmPayment(id, paymentRequest.getPaymentMethod()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BookingDto> getBookingById(@PathVariable Long id)
    {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BookingDto> cancelBooking(@PathVariable Long id)
    {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    @GetMapping("/number/{bookingNumber}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BookingDto> getBookingByNumber(@PathVariable String bookingNumber)
    {
        return ResponseEntity.ok(bookingService.getBookingByNumber(bookingNumber));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<BookingDto>> getBookingsByUser(@PathVariable Long userId)
    {
        return ResponseEntity.ok(bookingService.getBookingByUserId(userId));
    }
}

