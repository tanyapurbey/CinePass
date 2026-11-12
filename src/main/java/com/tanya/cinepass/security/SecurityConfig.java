package com.tanya.cinepass.security;

import lombok.RequiredArgsConstructor;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * @EnableWebSecurity turns on Spring Security's web support and gives us access to
 * customize the SecurityFilterChain bean below (this replaces Spring Boot's default
 * "lock down everything with a generated password" behavior).
 *
 * @EnableMethodSecurity(prePostEnabled = true) turns on @PreAuthorize/@PostAuthorize
 * annotations on controller and service methods, which is how we implement per-endpoint
 * role checks like @PreAuthorize("hasRole('ADMIN')").
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    private final CustomUserDetailsService userDetailsService;

    /**
     * BCrypt is a one-way, salted hashing algorithm built specifically for passwords.
     * "One-way" means there's no decrypt operation -- to check a login, we hash the
     * typed password again and compare hashes, we never reverse the stored hash.
     * The built-in salt (random per-password) means two users with the same password
     * get completely different stored hashes, which defeats rainbow-table attacks.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * DaoAuthenticationProvider is Spring Security's built-in strategy for
     * "look up the user via UserDetailsService, then compare the submitted password
     * against the stored (hashed) one using the PasswordEncoder". This is what actually
     * runs when AuthenticationManager.authenticate(...) is called from AuthController.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * Exposes Spring's AuthenticationManager as a bean so AuthController can inject it
     * and call .authenticate(...) during login, instead of us manually comparing
     * passwords (which would bypass all of Spring Security's protections).
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF protection is a browser-session/cookie concern. Since this API is
                // stateless and uses a Bearer token (not cookies) for auth, CSRF doesn't
                // apply and must be disabled or every POST/PUT/DELETE would be rejected.
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        // Only registration and login are reachable without a token.
                        .requestMatchers("/api/auth/**",
                                "/api/movies/**",
                                "/api/shows/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html").permitAll()
                        // Every other endpoint requires a valid, authenticated JWT.
                        // Fine-grained ADMIN-vs-USER checks are then layered on top via
                        // @PreAuthorize on individual controller methods.
                        .anyRequest().authenticated()
                )

                // STATELESS tells Spring Security: never create or read an HttpSession.
                // Each request must carry its own proof of identity (the JWT) because we
                // are not keeping any server-side login state between requests.
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authenticationProvider(authenticationProvider())

                // Called when an unauthenticated request hits a protected endpoint
                // (missing token, expired token, malformed token).
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) ->
                                writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED,
                                        "Unauthorized", "A valid JWT is required to access this resource"))
                        // Called when a valid, authenticated request is rejected by a
                        // @PreAuthorize check (right token, wrong role).
                        .accessDeniedHandler(accessDeniedHandler())
                )

                // Insert our JWT filter BEFORE Spring's default username/password filter,
                // so that by the time any built-in filter or our controllers run, the
                // SecurityContext is already populated from the token (if one was valid).
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) ->
                writeJsonError(response, HttpServletResponse.SC_FORBIDDEN,
                        "Forbidden", "You do not have permission to perform this action");
    }

    private void writeJsonError(HttpServletResponse response, int status, String error, String message) throws java.io.IOException {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", new Date());
        body.put("status", status);
        body.put("error", error);
        body.put("message", message);

        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(new ObjectMapper().writeValueAsString(body));
    }
}

