package com.tanya.cinepass.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDto {

    @NotNull(message = "User id is required")
    private Long userId;

    @NotNull(message = "Show id is required")
    private Long showId;

    @NotEmpty(message = "At least one seat must be selected")
    private List<Long> seatIds;

    // Only required by /api/bookings (legacy one-shot) and /api/bookings/{id}/confirm-payment;
    // /api/bookings/lock ignores this field, so it is intentionally left unvalidated here.
    private String paymentMethod;
}

