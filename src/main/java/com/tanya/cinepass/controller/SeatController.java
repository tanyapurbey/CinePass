package com.tanya.cinepass.controller;

import lombok.RequiredArgsConstructor;

import com.tanya.cinepass.dto.SeatDto;
import com.tanya.cinepass.service.SeatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screens/{screenId}/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SeatDto> createSeat(@PathVariable Long screenId, @Valid @RequestBody SeatDto seatDto)
    {
        return new ResponseEntity<>(seatService.createSeat(screenId, seatDto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SeatDto>> getSeatsByScreen(@PathVariable Long screenId)
    {
        return ResponseEntity.ok(seatService.getSeatsByScreen(screenId));
    }

    @GetMapping("/{seatId}")
    public ResponseEntity<SeatDto> getSeatById(@PathVariable Long screenId, @PathVariable Long seatId)
    {
        return ResponseEntity.ok(seatService.getSeatById(seatId));
    }

    @DeleteMapping("/{seatId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSeat(@PathVariable Long screenId, @PathVariable Long seatId)
    {
        seatService.deleteSeat(seatId);
        return ResponseEntity.noContent().build();
    }
}

