package com.tanya.cinepass.service;

import lombok.RequiredArgsConstructor;

import com.tanya.cinepass.Exception.ResourceNotFoundException;
import com.tanya.cinepass.dto.ScreenDto;
import com.tanya.cinepass.dto.TheaterDto;
import com.tanya.cinepass.model.Screen;
import com.tanya.cinepass.model.Theater;
import com.tanya.cinepass.repository.ScreenRepository;
import com.tanya.cinepass.repository.TheaterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScreenService {

    private final ScreenRepository screenRepository;

    private final TheaterRepository theaterRepository;

    public ScreenDto createScreen(Long theaterId, ScreenDto screenDto)
    {
        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new ResourceNotFoundException("Theater not found with id: " + theaterId));

        Screen screen = new Screen();
        screen.setName(screenDto.getName());
        screen.setTotalSeats(screenDto.getTotalSeats());
        screen.setTheater(theater);

        Screen savedScreen = screenRepository.save(screen);
        return mapToDto(savedScreen);
    }

    public ScreenDto getScreenById(Long id)
    {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Screen not found with id: " + id));
        return mapToDto(screen);
    }

    public List<ScreenDto> getScreensByTheater(Long theaterId)
    {
        List<Screen> screens = screenRepository.findByTheaterId(theaterId);
        return screens.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ScreenDto mapToDto(Screen screen)
    {
        ScreenDto screenDto = new ScreenDto();
        screenDto.setId(screen.getId());
        screenDto.setName(screen.getName());
        screenDto.setTotalSeats(screen.getTotalSeats());

        Theater theater = screen.getTheater();
        TheaterDto theaterDto = new TheaterDto();
        theaterDto.setId(theater.getId());
        theaterDto.setName(theater.getName());
        theaterDto.setAddress(theater.getAddress());
        theaterDto.setCity(theater.getCity());
        theaterDto.setTotalScreens(theater.getTotalScreens());
        screenDto.setTheater(theaterDto);

        return screenDto;
    }
}

