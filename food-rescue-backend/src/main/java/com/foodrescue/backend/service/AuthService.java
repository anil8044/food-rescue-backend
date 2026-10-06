package com.foodrescue.backend.service;

import com.foodrescue.backend.dto.LoginRequest;
import com.foodrescue.backend.dto.UserDTO;
import com.foodrescue.backend.exception.UnauthorizedException;
import com.foodrescue.backend.model.User;
import com.foodrescue.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Checks an email and password and returns the matching user.
 * There is no token yet, so this only identifies the user to the frontend.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private static final String INVALID_LOGIN = "Invalid email or password";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDTO login(LoginRequest request) {
        // The same message is used for an unknown email and a wrong password,
        // so the response doesn't reveal which accounts exist.
        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new UnauthorizedException(INVALID_LOGIN));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException(INVALID_LOGIN);
        }

        return new UserDTO(
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
    }
}