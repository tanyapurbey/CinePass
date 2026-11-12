package com.tanya.cinepass.security;

import lombok.RequiredArgsConstructor;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * A Spring "filter" runs on every single incoming HTTP request, before it reaches any
 * @RestController. OncePerRequestFilter guarantees this logic executes exactly once per
 * request even in complex dispatch scenarios (e.g. forwards).
 *
 * This filter's job: look for "Authorization: Bearer <token>" on the request, and if a
 * valid token is present, tell Spring Security "this request is authenticated as this
 * user, with these roles" by populating the SecurityContextHolder. Every @PreAuthorize
 * check and every controller's authentication state downstream relies on this being set.
 *
 * It's registered in SecurityConfig with addFilterBefore(..., UsernamePasswordAuthenticationFilter.class),
 * meaning it runs before Spring Security's own default username/password filter.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // No token, or not a Bearer token -> just let the request continue unauthenticated.
        // SecurityConfig will reject it later if the endpoint requires authentication.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7); // strip "Bearer " prefix
        final String userEmail;

        try {
            userEmail = jwtUtil.extractEmail(jwt);
        } catch (Exception e) {
            // Malformed, tampered, or expired token -- treat as unauthenticated rather
            // than throwing, so the response is a clean 401/403 instead of a 500.
            filterChain.doFilter(request, response);
            return;
        }

        // Only set authentication if it isn't already set for this request AND we found an email.
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

            if (jwtUtil.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // This is the key line: from this point on, for the rest of this request,
                // Spring Security considers the caller authenticated as this user.
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}

