package com.tanya.cinepass.service;

import lombok.RequiredArgsConstructor;

import com.tanya.cinepass.Exception.ResourceNotFoundException;
import com.tanya.cinepass.Exception.SeatUnavailableException;
import com.tanya.cinepass.dto.*;
import com.tanya.cinepass.model.*;
import com.tanya.cinepass.repository.BookingRepository;
import com.tanya.cinepass.repository.ShowRepository;
import com.tanya.cinepass.repository.ShowSeatRepository;
import com.tanya.cinepass.repository.UserRepository;
import com.tanya.cinepass.security.SecurityUtils;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final UserRepository userRepository;

    private final ShowRepository showRepository;

    private final ShowSeatRepository showSeatRepository;

    private final BookingRepository bookingRepository;

    @Transactional
    public BookingDto createBooking(BookingRequestDto bookingRequest)
    {
        SecurityUtils.verifyOwnerOrAdmin(bookingRequest.getUserId());

        User user= userRepository.findById(bookingRequest.getUserId())
                .orElseThrow(()->new ResourceNotFoundException("User Not Found"));

        Show show = showRepository.findById(bookingRequest.getShowId())
                .orElseThrow(()->new ResourceNotFoundException("Show Not Found"));

        // findAllByIdForUpdate issues "SELECT ... FOR UPDATE": the database locks these
        // exact rows until this transaction commits, so a second, simultaneous booking
        // request for the same seats physically waits here instead of also reading
        // "AVAILABLE" and double-booking the seat.
        List<ShowSeat> selectedSeats=showSeatRepository.findAllByIdForUpdate(bookingRequest.getSeatIds());

        for(ShowSeat seat:selectedSeats)
        {
            if(!"AVAILABLE".equals(seat.getStatus()))
            {
                throw  new SeatUnavailableException("Seat "+seat.getSeat().getSeatNumber()+" is not available");
            }
            seat.setStatus("LOCKED");
        }
        showSeatRepository.saveAll(selectedSeats);

        Double totalAmount=selectedSeats.stream()
                .mapToDouble(ShowSeat::getPrice)
                .sum();

        //payment
        Payment payment=new Payment();
        payment.setAmount(totalAmount);
        payment.setPaymentTime(LocalDateTime.now());
        payment.setPaymentMethod(bookingRequest.getPaymentMethod());
        payment.setStatus("SUCCESS");
        payment.setTransactionId(UUID.randomUUID().toString());


        //booking
        Booking booking=new Booking();
        booking.setUser(user);
        booking.setShow(show);
        booking.setBookingTime(LocalDateTime.now());
        booking.setStatus("CONFIRMED");
        booking.setTotalAmount(totalAmount);
        booking.setBookingNumber(UUID.randomUUID().toString());
        booking.setPayment(payment);

        Booking saveBooking=bookingRepository.save(booking);

        selectedSeats.forEach(seat->
        {
            seat.setStatus("BOOKED");
            seat.setBooking(saveBooking);
        });
        showSeatRepository.saveAll(selectedSeats);
        return mapToBookingDto(saveBooking,selectedSeats);
    }

    /**
     * STEP 1 of the smart seat-locking workflow: the user has picked seats but has not
     * paid yet. We lock the seats and create a PENDING booking with no payment attached.
     * The seats' lockedAt timestamp starts a 5-minute clock (booking.lock.duration.minutes);
     * SeatUnlockScheduler checks this timestamp every minute and releases any seat whose
     * hold has expired without payment.
     */
    @Transactional
    public BookingDto lockSeats(BookingRequestDto bookingRequest)
    {
        SecurityUtils.verifyOwnerOrAdmin(bookingRequest.getUserId());

        User user= userRepository.findById(bookingRequest.getUserId())
                .orElseThrow(()->new ResourceNotFoundException("User Not Found"));

        Show show = showRepository.findById(bookingRequest.getShowId())
                .orElseThrow(()->new ResourceNotFoundException("Show Not Found"));

        List<ShowSeat> selectedSeats=showSeatRepository.findAllByIdForUpdate(bookingRequest.getSeatIds());

        for(ShowSeat seat:selectedSeats)
        {
            if(!"AVAILABLE".equals(seat.getStatus()))
            {
                throw new SeatUnavailableException("Seat "+seat.getSeat().getSeatNumber()+" is not available");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        selectedSeats.forEach(seat -> {
            seat.setStatus("LOCKED");
            seat.setLockedAt(now);
        });

        Double totalAmount=selectedSeats.stream()
                .mapToDouble(ShowSeat::getPrice)
                .sum();

        Booking booking=new Booking();
        booking.setUser(user);
        booking.setShow(show);
        booking.setBookingTime(now);
        booking.setStatus("PENDING"); // awaiting payment -- not yet CONFIRMED
        booking.setTotalAmount(totalAmount);
        booking.setBookingNumber(UUID.randomUUID().toString());

        Booking savedBooking = bookingRepository.save(booking);

        selectedSeats.forEach(seat -> seat.setBooking(savedBooking));
        showSeatRepository.saveAll(selectedSeats);

        return mapToBookingDto(savedBooking, selectedSeats);
    }

    /**
     * STEP 2 of the smart seat-locking workflow: called once the user actually pays.
     * Confirms the PENDING booking, only if its seats are still LOCKED (i.e. the
     * 5-minute window hasn't already been swept up by the scheduler).
     */
    @Transactional
    public BookingDto confirmPayment(Long bookingId, String paymentMethod)
    {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking Not Found"));

        SecurityUtils.verifyOwnerOrAdmin(booking.getUser().getId());

        if (!"PENDING".equals(booking.getStatus()))
        {
            throw new SeatUnavailableException(
                    "Booking is not awaiting payment (current status: " + booking.getStatus() + ")");
        }

        List<ShowSeat> seats = showSeatRepository.findByBookingId(booking.getId());

        for (ShowSeat seat : seats)
        {
            if (!"LOCKED".equals(seat.getStatus()))
            {
                // The scheduler already released this seat because the 5-minute
                // window expired before payment arrived.
                throw new SeatUnavailableException("Seat lock has expired. Please select seats again.");
            }
        }

        Payment payment = new Payment();
        payment.setAmount(booking.getTotalAmount());
        payment.setPaymentTime(LocalDateTime.now());
        payment.setPaymentMethod(paymentMethod);
        payment.setStatus("SUCCESS");
        payment.setTransactionId(UUID.randomUUID().toString());

        booking.setPayment(payment);
        booking.setStatus("CONFIRMED");
        Booking updatedBooking = bookingRepository.save(booking);

        seats.forEach(seat -> {
            seat.setStatus("BOOKED");
            seat.setLockedAt(null);
        });
        showSeatRepository.saveAll(seats);

        return mapToBookingDto(updatedBooking, seats);
    }


    public BookingDto getBookingById(Long id)
    {
        Booking booking=bookingRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Booking Not Found"));
        SecurityUtils.verifyOwnerOrAdmin(booking.getUser().getId());
        List<ShowSeat> seats=showSeatRepository.findByBookingId(booking.getId());
        return mapToBookingDto(booking,seats);
    }

    public BookingDto getBookingByNumber(String bookingNumber)
    {
        Booking booking=bookingRepository.findByBookingNumber(bookingNumber)
                .orElseThrow(()->new ResourceNotFoundException("Booking Not Found"));
        SecurityUtils.verifyOwnerOrAdmin(booking.getUser().getId());
        List<ShowSeat> seats=showSeatRepository.findByBookingId(booking.getId());
        return mapToBookingDto(booking,seats);
    }

    public List<BookingDto> getBookingByUserId(Long userId)
    {
        SecurityUtils.verifyOwnerOrAdmin(userId);
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        return bookings.stream()
                .map(booking -> {
                    List<ShowSeat> seats=showSeatRepository.findByBookingId(booking.getId());
                    return mapToBookingDto(booking,seats);
                })
                .collect(Collectors.toList());

    }

    @Transactional
    public BookingDto cancelBooking(Long id)
    {
        Booking booking=bookingRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Booking Not found"));

        SecurityUtils.verifyOwnerOrAdmin(booking.getUser().getId());

        booking.setStatus("CANCELLED");

        List<ShowSeat> seats=showSeatRepository.findByBookingId(booking.getId());

        seats.forEach(seat->{
            seat.setStatus("AVAILABLE");
            seat.setBooking(null);
        });

        if (booking.getPayment()!=null)
        {
            booking.getPayment().setStatus("REFUNDED");
        }

        Booking updateBooking=bookingRepository.save(booking);
        showSeatRepository.saveAll(seats);
        return mapToBookingDto(updateBooking,seats);

    }


    private BookingDto mapToBookingDto(Booking booking,List<ShowSeat> seats)
    {
        BookingDto bookingDto=new BookingDto();
        bookingDto.setId(booking.getId());
        bookingDto.setBookingNumber(booking.getBookingNumber());
        bookingDto.setBookingTime(booking.getBookingTime());
        bookingDto.setStatus(booking.getStatus());
        bookingDto.setTotalAmount(booking.getTotalAmount());

        //user
        UserDto userDto=new UserDto();
        userDto.setId(booking.getUser().getId());
        userDto.setName(booking.getUser().getName());
        userDto.setEmail(booking.getUser().getEmail());
        userDto.setPhoneNumber(booking.getUser().getPhoneNumber());
        userDto.setRole(booking.getUser().getRole().name());
        bookingDto.setUser(userDto);

        ShowDto showDto=new ShowDto();
        showDto.setId(booking.getShow().getId());
        showDto.setStartTime(booking.getShow().getStartTime());
        showDto.setEndTime(booking.getShow().getEndTime());

        MovieDto movieDto = new MovieDto();
        movieDto.setId(booking.getShow().getMovie().getId());
        movieDto.setTitle(booking.getShow().getMovie().getTitle());
        movieDto.setDescription(booking.getShow().getMovie().getDescription());
        movieDto.setLanguage(booking.getShow().getMovie().getLanguage());
        movieDto.setGenre(booking.getShow().getMovie().getGenre());
        movieDto.setDurationMins(booking.getShow().getMovie().getDurationMins());
        movieDto.setReleaseDate(booking.getShow().getMovie().getReleaseDate());
        movieDto.setPosterUrl(booking.getShow().getMovie().getPosterUrl());
        showDto.setMovie(movieDto);


        ScreenDto screenDto=new ScreenDto();
        screenDto.setId(booking.getShow().getScreen().getId());
        screenDto.setName(booking.getShow().getScreen().getName());
        screenDto.setTotalSeats(booking.getShow().getScreen().getTotalSeats());


        TheaterDto theaterDto=new TheaterDto();
        theaterDto.setId(booking.getShow().getScreen().getTheater().getId());
        theaterDto.setName(booking.getShow().getScreen().getTheater().getName());
        theaterDto.setAddress(booking.getShow().getScreen().getTheater().getAddress());
        theaterDto.setCity(booking.getShow().getScreen().getTheater().getCity());
        theaterDto.setTotalScreens(booking.getShow().getScreen().getTheater().getTotalScreens());

        screenDto.setTheater(theaterDto);
        showDto.setScreen(screenDto);
        bookingDto.setShow(showDto);


        List<ShowSeatDto> seatDtos=seats.stream()
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
        bookingDto.setSeats(seatDtos);


        if(booking.getPayment()!=null)
        {
            PaymentDto paymentDto=new PaymentDto();
            paymentDto.setId(booking.getPayment().getId());
            paymentDto.setAmount(booking.getPayment().getAmount());
            paymentDto.setPaymentMethod(booking.getPayment().getPaymentMethod());
            paymentDto.setPaymentTime(booking.getPayment().getPaymentTime());
            paymentDto.setStatus(booking.getPayment().getStatus());
            paymentDto.setTransactionId(booking.getPayment().getTransactionId());
            bookingDto.setPayment(paymentDto);
        }

        return bookingDto;

    }
}
