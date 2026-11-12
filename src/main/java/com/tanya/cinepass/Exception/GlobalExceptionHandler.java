package com.tanya.cinepass.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> authenticationException(AuthenticationException ex, WebRequest request)
    {
        // Thrown by AuthenticationManager.authenticate(...) in AuthController.login()
        // when the email doesn't exist or the password doesn't match the stored hash.
        ErrorResponse errorDetails=new ErrorResponse(new Date(), HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized","Invalid email or password",request.getDescription(false));
        return new ResponseEntity<>(errorDetails,HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> accessDeniedException(AccessDeniedException ex, WebRequest request)
    {
        // Thrown when a @PreAuthorize check fails -- e.g. a logged-in USER calling an
        // ADMIN-only endpoint like POST /api/movies. The token is valid, the caller is
        // just not allowed to do this particular action.
        ErrorResponse errorDetails=new ErrorResponse(new Date(), HttpStatus.FORBIDDEN.value(),
                "Forbidden","You do not have permission to perform this action",request.getDescription(false));
        return new ResponseEntity<>(errorDetails,HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validationException(MethodArgumentNotValidException ex, WebRequest request)
    {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage()));

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", new Date());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("fieldErrors", fieldErrors);
        body.put("path", request.getDescription(false));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> resourceNotFoundException(ResourceNotFoundException ex, WebRequest request)
    {
        ErrorResponse errorDetails=new ErrorResponse(new Date(), HttpStatus.NOT_FOUND.value(),
                "Not Found",ex.getMessage(),request.getDescription(false));

        return new ResponseEntity<>(errorDetails,HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(SeatUnavailableException.class)
    public ResponseEntity<?> seatUnavailableException(SeatUnavailableException ex, WebRequest request)
    {
        ErrorResponse errorDetails=new ErrorResponse(
                new Date(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                request.getDescription(false));

        return new ResponseEntity<>(errorDetails,HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> globalExceptionalHandler(Exception ex, WebRequest request)
    {
        ErrorResponse errorDetails=new ErrorResponse(
                new Date(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Server Error",
                ex.getMessage(),
                request.getDescription(false));

        return new ResponseEntity<>(errorDetails,HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

