package com.tanya.cinepass.security;

import com.tanya.cinepass.model.Role;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Small, stateless helper used by the service layer to answer one question:
 * "is the currently authenticated caller allowed to touch this particular
 * piece of data?"
 *
 * Role checks alone (@PreAuthorize("hasAnyRole('USER','ADMIN')")) only prove
 * that the caller IS a user -- they don't stop USER #7 from reading or
 * cancelling USER #9's booking, since both callers hold the same ROLE_USER
 * authority. That's an "IDOR" (Insecure Direct Object Reference) hole: any
 * authenticated user could pass a different id in the URL and see/modify
 * someone else's data.
 *
 * verifyOwnerOrAdmin(...) closes that hole: it allows the request through
 * only if the caller is an ADMIN, or the caller's own user id matches the
 * id of the resource's owner. Otherwise it throws AccessDeniedException,
 * which GlobalExceptionHandler already turns into a clean 403 response.
 */
public final class SecurityUtils {

    private SecurityUtils() {
        // utility class -- never instantiated
    }

    /**
     * Reads the currently authenticated principal out of Spring Security's
     * SecurityContextHolder. JwtAuthFilter is what populates this on every
     * request that carries a valid JWT, so by the time a service method
     * runs, this is already available without needing it passed in manually.
     */
    public static UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }

    /**
     * Throws AccessDeniedException unless the caller is an ADMIN or the
     * caller's own id equals ownerId. Safe to call with a null ownerId
     * (denies access) so callers don't need a separate null check.
     */
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

