package com.foodrescue.backend.service;

import com.foodrescue.backend.dto.UserDTO;
import com.foodrescue.backend.dto.CreateUserRequest;
import com.foodrescue.backend.dto.UpdateUserRequest;
import com.foodrescue.backend.model.User;
import com.foodrescue.backend.model.VerificationStatus;
import com.foodrescue.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for user management and operations.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Retrieve all users (admin only).
     */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve a user by ID.
     */
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return toDTO(user);
    }

    /**
     * Retrieve a user by email.
     */
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return toDTO(user);
    }

    /**
     * Create a new user.
     */
    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setOrganisationName(request.getOrganisationName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());

        // Recipient orgs start as PENDING verification
        if (user.getRole().toString().equals("RECIPIENT_ORG")) {
            user.setVerificationStatus(VerificationStatus.PENDING);
        }

        User savedUser = userRepository.save(user);
        return toDTO(savedUser);
    }

    /**
     * Update an existing user.
     */
    public UserDTO updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getOrganisationName() != null) {
            user.setOrganisationName(request.getOrganisationName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getVerificationStatus() != null) {
            user.setVerificationStatus(request.getVerificationStatus());
        }

        User updatedUser = userRepository.save(user);
        return toDTO(updatedUser);
    }

    /**
     * Delete a user.
     */
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Get all pending verification requests.
     */
    public List<UserDTO> getPendingVerifications() {
        return userRepository.findByVerificationStatus(VerificationStatus.PENDING).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert User entity to UserDTO.
     */
    private UserDTO toDTO(User user) {
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
