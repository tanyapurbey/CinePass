package com.tanya.cinepass.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

/**
 * A JWT (JSON Web Token) is a compact, self-contained, digitally signed string with
 * three Base64Url parts separated by dots: header.payload.signature
 *   - header:    which signing algorithm was used (here, HS256)
 *   - payload:   the "claims" -- data about the user (subject/email, issued time, expiry)
 *   - signature: HMAC-SHA256 of the header+payload, computed with our secret key
 *
 * Because the signature is computed with a secret key only the server knows, the server
 * can later verify a token wasn't tampered with, WITHOUT needing to store any session
 * state in a database -- this is what "stateless authentication" means. The token itself
 * carries everything needed to trust it.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration.ms}")
    private long expirationMs;

    private SecretKey getSigningKey() {
        // jjwt needs a raw byte key. Ours is stored Base64-encoded in application.properties,
        // so we decode it back to bytes before use.
        byte[] keyBytes = io.jsonwebtoken.io.Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** Builds a signed JWT whose subject is the user's email, valid for jwt.expiration.ms. */
    public String generateToken(UserDetails userDetails) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(userDetails.getUsername()) // "sub" claim = email
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /** A token is valid if it belongs to the given user AND hasn't expired. */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
}

