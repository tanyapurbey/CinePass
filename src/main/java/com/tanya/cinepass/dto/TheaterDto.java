package com.tanya.cinepass.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheaterDto {

    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private Integer totalScreens;

}
