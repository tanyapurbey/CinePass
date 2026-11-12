package com.tanya.cinepass.security;

import lombok.RequiredArgsConstructor;

import com.tanya.cinepass.model.User;
import com.tanya.cinepass.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Spring Security calls loadUserByUsername(...) in two places in this project:
 *   1. Inside AuthenticationManager.authenticate(...) during login, to fetch the
 *      stored (hashed) password and compare it against what the user typed.
 *   2. Inside JwtAuthFilter on every protected request, to reload the user's current
 *      roles/details so SecurityContext has a fully-formed Authentication object.
 *
 * "Username" here is really the user's email, since that's what this project uses
 * as the unique login identifier.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("No user found with email: " + email));
        return new UserPrincipal(user);
    }
}

