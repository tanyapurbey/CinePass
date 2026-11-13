package com.tanya.cinepass.controller;

import lombok.RequiredArgsConstructor;

import com.tanya.cinepass.dto.ScreenDto;
import com.tanya.cinepass.service.ScreenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theaters/{theaterId}/screens")
@RequiredArgsConstructor
public class ScreenController {

    private final ScreenService screenService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ScreenDto> createScreen(@PathVariable Long theaterId, @Valid @RequestBody ScreenDto screenDto)
    {
        return new ResponseEntity<>(screenService.createScreen(theaterId, screenDto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ScreenDto>> getScreensByTheater(@PathVariable Long theaterId)
    {
        return ResponseEntity.ok(screenService.getScreensByTheater(theaterId));
    }

    @GetMapping("/{screenId}")
    public ResponseEntity<ScreenDto> getScreenById(@PathVariable Long theaterId, @PathVariable Long screenId)
    {
        return ResponseEntity.ok(screenService.getScreenById(screenId));
    }
}
