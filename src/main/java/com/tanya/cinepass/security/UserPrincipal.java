package com.tanya.cinepass.security;

import com.tanya.cinepass.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Spring Security works against the {@link UserDetails} interface, not against our
 * own {@link User} entity. Rather than making the User entity implement UserDetails
 * directly (which would tie our JPA model to a security-framework interface), we wrap
 * it in this small adapter. This keeps the entity layer clean and framework-agnostic,
 * consistent with the rest of this project's DTO/entity separation.
 */
public class UserPrincipal implements UserDetails {

    private final User user;

    public UserPrincipal(User user) {
        this.user = user;
    }

    /** Exposes the wrapped entity so controllers/services can read the real user id, etc. */
    public User getUser() {
        return user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Spring Security's hasRole("ADMIN") checks for an authority literally named
        // "ROLE_ADMIN". We prefix here so hasRole(...) works correctly everywhere in
        // this project (this is the exact ROLE_ prefix mismatch that caused 403s
        // in an earlier version of this project's Spring Security learning tutorial).
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        // We authenticate by email, so "username" for Spring Security purposes is the email.
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

