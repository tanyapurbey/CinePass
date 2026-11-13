package com.tanya.cinepass.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScreenDto {
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private Integer totalSeats;
    private TheaterDto theater;
}
