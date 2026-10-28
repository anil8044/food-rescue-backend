package com.foodrescue.backend.security;

import com.foodrescue.backend.model.User;
import com.foodrescue.backend.model.VerificationStatus;
import com.foodrescue.backend.model.Role;
import com.foodrescue.backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Reads "Authorization: Bearer <token>", checks it, and signs the user in for this
 * request only. A missing or invalid token leaves the request anonymous, and the
 * rules in SecurityConfig then answer 401.
 *
 * This filter is created inside SecurityConfig (it is not a Spring bean) so that
 * Spring Boot does not register it a second time as a servlet filter.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwtService.parse(header.substring(7).trim());
                Optional<User> found = userRepository.findById(Long.valueOf(claims.getSubject()));
                if (found.isPresent() && isActive(found.get())) {
                    User user = found.get();
                    AuthUser principal = new AuthUser(user.getId(), user.getEmail(), user.getRole());
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            principal, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (JwtException | IllegalArgumentException ex) {
                // Invalid, expired or malformed token: continue as anonymous.
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }

    /** A suspended or rejected recipient organisation can no longer use the API. */
    static boolean isActive(User user) {
        return !(user.getRole() == Role.RECIPIENT_ORG
                && user.getVerificationStatus() == VerificationStatus.REJECTED);
    }
}
