package com.tanya.cinepass.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieDto {

    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String language;
    private String genre;

    @Positive(message = "Duration must be positive")
    private Integer durationMins;

    private String releaseDate;
    private String posterUrl;
}

