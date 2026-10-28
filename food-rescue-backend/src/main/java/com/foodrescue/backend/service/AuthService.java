package com.foodrescue.backend.service;

import com.foodrescue.backend.dto.AuthResponse;
import com.foodrescue.backend.dto.LoginRequest;
import com.foodrescue.backend.dto.UserDTO;
import com.foodrescue.backend.exception.UnauthorizedException;
import com.foodrescue.backend.model.Role;
import com.foodrescue.backend.model.User;
import com.foodrescue.backend.model.VerificationStatus;
import com.foodrescue.backend.repository.UserRepository;
import com.foodrescue.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Checks an email and password and returns a signed token with the matching user.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private static final String INVALID_LOGIN = "Invalid email or password";
    private static final String INACTIVE_ACCOUNT =
            "This account is not active. Please contact the Food Rescue Network.";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        // The same message is used for an unknown email and a wrong password,
        // so the response doesn't reveal which accounts exist.
        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new UnauthorizedException(INVALID_LOGIN));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException(INVALID_LOGIN);
        }

        // A suspended or rejected recipient organisation cannot sign in.
        if (user.getRole() == Role.RECIPIENT_ORG
                && user.getVerificationStatus() == VerificationStatus.REJECTED) {
            throw new UnauthorizedException(INACTIVE_ACCOUNT);
        }

        UserDTO dto = new UserDTO(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getOrganisationName(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getVerificationStatus(),
                user.getCreatedAt()
        );
        return new AuthResponse(jwtService.createToken(user), "Bearer", jwtService.getExpiresInSeconds(), dto);
    }
}
