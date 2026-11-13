package com.tanya.cinepass.security;

import com.tanya.cinepass.model.Role;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


public final class SecurityUtils {

    private SecurityUtils() {

    }


    public static UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }


    public static void verifyOwnerOrAdmin(Long ownerId) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            throw new AccessDeniedException("Authentication is required to access this resource");
        }

        boolean isAdmin = principal.getUser().getRole() == Role.ADMIN;
        boolean isOwner = ownerId != null && ownerId.equals(principal.getUser().getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You do not have permission to access this resource");
        }
    }
}
