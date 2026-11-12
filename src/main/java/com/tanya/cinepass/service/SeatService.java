package com.tanya.cinepass.service;

import lombok.RequiredArgsConstructor;

import com.tanya.cinepass.Exception.ResourceNotFoundException;
import com.tanya.cinepass.dto.SeatDto;
import com.tanya.cinepass.model.Screen;
import com.tanya.cinepass.model.Seat;
import com.tanya.cinepass.repository.ScreenRepository;
import com.tanya.cinepass.repository.SeatRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;

    private final ScreenRepository screenRepository;

    public SeatDto createSeat(Long screenId, SeatDto seatDto)
    {
        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new ResourceNotFoundException("Screen not found with id: " + screenId));

        Seat seat = new Seat();
        seat.setSeatNumber(seatDto.getSeatNumber());
        seat.setSeatType(seatDto.getSeatType());
        seat.setBasePrice(seatDto.getBasePrice());
        seat.setScreen(screen);

        Seat savedSeat = seatRepository.save(seat);
        return mapToDto(savedSeat);
    }

    public SeatDto getSeatById(Long id)
    {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + id));
        return mapToDto(seat);
    }

    public List<SeatDto> getSeatsByScreen(Long screenId)
    {
        List<Seat> seats = seatRepository.findByScreenId(screenId);
        return seats.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void deleteSeat(Long id)
    {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + id));
        seatRepository.delete(seat);
    }

    private SeatDto mapToDto(Seat seat)
    {
        SeatDto seatDto = new SeatDto();
        seatDto.setId(seat.getId());
        seatDto.setSeatNumber(seat.getSeatNumber());
        seatDto.setSeatType(seat.getSeatType());
        seatDto.setBasePrice(seat.getBasePrice());
        return seatDto;
    }
}

