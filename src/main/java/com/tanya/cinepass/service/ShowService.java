package com.tanya.cinepass.service;

import lombok.RequiredArgsConstructor;

import com.tanya.cinepass.dto.*;
import com.tanya.cinepass.Exception.ResourceNotFoundException;
import com.tanya.cinepass.model.Movie;
import com.tanya.cinepass.model.Screen;
import com.tanya.cinepass.model.Seat;
import com.tanya.cinepass.model.Show;
import com.tanya.cinepass.model.ShowSeat;
import com.tanya.cinepass.repository.MovieRepository;
import com.tanya.cinepass.repository.ScreenRepository;
import com.tanya.cinepass.repository.ShowRepository;
import com.tanya.cinepass.repository.ShowSeatRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowService {

    private final MovieRepository movieRepository;

    private final ScreenRepository screenRepository;

    private final ShowRepository showRepository;

    private final ShowSeatRepository showSeatRepository;

    @org.springframework.transaction.annotation.Transactional
    public ShowDto creteShow(ShowDto showDto)
    {
        Show show=new Show();
        Movie movie=movieRepository.findById(showDto.getMovie().getId())
                .orElseThrow(()-> new ResourceNotFoundException("Movie Not Found"));

        Screen screen=screenRepository.findById(showDto.getScreen().getId())
                .orElseThrow(()-> new ResourceNotFoundException("Screen Not Found"));

        show.setMovie(movie);
        show.setScreen(screen);
        show.setStartTime(showDto.getStartTime());
        show.setEndTime(showDto.getEndTime());

        Show savedShow=showRepository.save(show);


        List<Seat> physicalSeats = screen.getSeats();
        List<ShowSeat> generatedSeats = new ArrayList<>();
        if (physicalSeats != null)
        {
            for (Seat seat : physicalSeats)
            {
                ShowSeat showSeat = new ShowSeat();
                showSeat.setShow(savedShow);
                showSeat.setSeat(seat);
                showSeat.setStatus("AVAILABLE");
                showSeat.setPrice(seat.getBasePrice());
                generatedSeats.add(showSeat);
            }
            showSeatRepository.saveAll(generatedSeats);
        }

        List<ShowSeat> availableSeats=
                showSeatRepository.findByShowIdAndStatus(savedShow.getId(),"AVAILABLE");
        return mapToDto(savedShow,availableSeats);
    }

    public ShowDto getShowById(Long id)
    {
        Show show=showRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Show not found  with id: "+id));
        List<ShowSeat> availableSeats=
                showSeatRepository.findByShowIdAndStatus(show.getId(),"AVAILABLE");
        return mapToDto(show,availableSeats);
    }

    public List<ShowDto> getAllShows()
    {
        List<Show> shows=showRepository.findAll();
        return shows.stream()
                .map(show -> {
                    List<ShowSeat> availableSeats = showSeatRepository.findByShowIdAndStatus(show.getId(), "AVAILABLE");
                    return mapToDto(show,availableSeats);
                })
                .collect(Collectors.toList());
    }

    public List<ShowDto> getShowsByMovie(Long movieId)
    {
        List<Show> shows=showRepository.findByMovieId(movieId);
        return shows.stream()
                .map(show -> {
                    List<ShowSeat> availableSeats = showSeatRepository.findByShowIdAndStatus(show.getId(), "AVAILABLE");
                    return mapToDto(show,availableSeats);
                })
                .collect(Collectors.toList());
    }

    public List<ShowDto> getShowsByMovieAndCity(Long movieId,String city)
    {
        List<Show> shows=showRepository.findByMovie_IdAndScreen_Theater_City(movieId,city);
        return shows.stream()
                .map(show -> {
                    List<ShowSeat> availableSeats = showSeatRepository.findByShowIdAndStatus(show.getId(), "AVAILABLE");
                    return mapToDto(show,availableSeats);
                })
                .collect(Collectors.toList());
    }

    public List<ShowDto> getShowsByDateRange(LocalDateTime startDate, LocalDateTime endDate)
    {
        List<Show> shows=showRepository.findByStartTimeBetween(startDate,endDate);
        return shows.stream()
                .map(show -> {
                    List<ShowSeat> availableSeats = showSeatRepository.findByShowIdAndStatus(show.getId(), "AVAILABLE");
                    return mapToDto(show,availableSeats);
                })
                .collect(Collectors.toList());
    }

    private ShowDto mapToDto(Show show,List<ShowSeat> availableSeats)
    {
        ShowDto showDto= new ShowDto();
        showDto.setId(show.getId());
        showDto.setStartTime(show.getStartTime());
        showDto.setEndTime(show.getEndTime());

        showDto.setMovie(new MovieDto(
                show.getMovie().getId(),
                show.getMovie().getTitle(),
                show.getMovie().getDescription(),
                show.getMovie().getLanguage(),
                show.getMovie().getGenre(),
                show.getMovie().getDurationMins(),
                show.getMovie().getReleaseDate(),
                show.getMovie().getPosterUrl()
        ));

        TheaterDto theaterDto=new TheaterDto(
                show.getScreen().getTheater().getId(),
                show.getScreen().getTheater().getName(),
                show.getScreen().getTheater().getAddress(),
                show.getScreen().getTheater().getCity(),
                show.getScreen().getTheater().getTotalScreens()
        );

        showDto.setScreen(new ScreenDto(
                show.getScreen().getId(),
                show.getScreen().getName(),
                show.getScreen().getTotalSeats(),
                theaterDto
        ));

        List<ShowSeatDto> seatDtos= availableSeats.stream()
                .map(seat->{
                    ShowSeatDto seatDto=new ShowSeatDto();
                    seatDto.setId(seat.getId());
                    seatDto.setStatus(seat.getStatus());
                    seatDto.setPrice(seat.getPrice());

                    SeatDto baseSeatDto=new SeatDto();
                    baseSeatDto.setId(seat.getSeat().getId());
                    baseSeatDto.setSeatNumber(seat.getSeat().getSeatNumber());
                    baseSeatDto.setSeatType(seat.getSeat().getSeatType());
                    baseSeatDto.setBasePrice(seat.getSeat().getBasePrice());
                    seatDto.setSeat(baseSeatDto);
                    return seatDto;
                })
                .collect(Collectors.toList());

        showDto.setAvailableSeats(seatDtos);
        return showDto;
    }
}
