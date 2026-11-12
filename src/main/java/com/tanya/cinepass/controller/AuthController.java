package com.tanya.cinepass.controller;

import lombok.RequiredArgsConstructor;

import com.tanya.cinepass.dto.AuthResponseDto;
import com.tanya.cinepass.dto.LoginRequestDto;
import com.tanya.cinepass.dto.UserDto;
import com.tanya.cinepass.dto.UserRegistrationDto;
import com.tanya.cinepass.security.JwtUtil;
import com.tanya.cinepass.security.UserPrincipal;
import com.tanya.cinepass.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    private final AuthenticationManager authenticationManager;

    private final JwtUtil jwtUtil;

    /**
     * Public registration endpoint. Delegates straight to the existing UserService,
     * which now hashes the password and assigns Role.USER before saving.
     */
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody UserRegistrationDto registrationDto)
    {
        return new ResponseEntity<>(userService.createUser(registrationDto), HttpStatus.CREATED);
    }

    /**
     * Login flow:
     * 1. authenticationManager.authenticate(...) triggers DaoAuthenticationProvider,
     *    which calls CustomUserDetailsService to load the user by email, then uses
     *    PasswordEncoder.matches(...) to compare the submitted password against the
     *    stored BCrypt hash. If they don't match, it throws BadCredentialsException
     *    automatically (handled by GlobalExceptionHandler).
     * 2. If authentication succeeds, we know the credentials are correct, so we mint
     *    a JWT for this user and hand it back. The client stores this token and sends
     *    it as "Authorization: Bearer <token>" on every subsequent request.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginRequest)
    {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userPrincipal);

            AuthResponseDto response = new AuthResponseDto(
                    userPrincipal.getUser().getId(),
                    token,
                    userPrincipal.getUser().getEmail(),
                    userPrincipal.getUser().getRole().name()
            );
            return ResponseEntity.ok(response);
        } catch (AuthenticationException ex) {
            // Caught locally rather than left to GlobalExceptionHandler: Spring Security's
            // ExceptionTranslationFilter would otherwise intercept AuthenticationException
            // before it reaches our @ControllerAdvice, giving an empty default response.
            Map<String, Object> body = new HashMap<>();
            body.put("timestamp", new Date());
            body.put("status", HttpStatus.UNAUTHORIZED.value());
            body.put("error", "Unauthorized");
            body.put("message", "Invalid email or password");
            return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
        }
    }
}

