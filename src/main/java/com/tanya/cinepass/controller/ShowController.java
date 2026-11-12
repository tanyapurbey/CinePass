package com.tanya.cinepass.controller;

import lombok.RequiredArgsConstructor;

import com.tanya.cinepass.dto.ShowDto;
import com.tanya.cinepass.service.ShowService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/shows")
@RequiredArgsConstructor
public class ShowController {

    private final ShowService showService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowDto> createShow(@Valid @RequestBody ShowDto showDto)
    {
        return new ResponseEntity<>(showService.creteShow(showDto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowDto> getShowById(@PathVariable Long id)
    {
        return ResponseEntity.ok(showService.getShowById(id));
    }

    @GetMapping
    public ResponseEntity<List<ShowDto>> getAllShows()
    {
        return ResponseEntity.ok(showService.getAllShows());
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<ShowDto>> getShowsByMovie(@PathVariable Long movieId)
    {
        return ResponseEntity.ok(showService.getShowsByMovie(movieId));
    }

    @GetMapping("/movie/{movieId}/city/{city}")
    public ResponseEntity<List<ShowDto>> getShowsByMovieAndCity(@PathVariable Long movieId, @PathVariable String city)
    {
        return ResponseEntity.ok(showService.getShowsByMovieAndCity(movieId, city));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ShowDto>> getShowsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end)
    {
        return ResponseEntity.ok(showService.getShowsByDateRange(start, end));
    }
}

