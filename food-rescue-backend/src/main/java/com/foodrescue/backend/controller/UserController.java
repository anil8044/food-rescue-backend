package com.foodrescue.backend.controller;

import com.foodrescue.backend.dto.CreateUserRequest;
import com.foodrescue.backend.dto.UpdateUserRequest;
import com.foodrescue.backend.dto.UserDTO;
import com.foodrescue.backend.model.Role;
import com.foodrescue.backend.security.Authz;
import com.foodrescue.backend.service.UserService;
import org.springframework.security.access.AccessDeniedException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for user management endpoints.
 * Errors are handled centrally by GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final Authz authz;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PreAuthorize("@authz.selfOrAdmin(#id)")
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        // Anyone can register as a donor or recipient organisation.
        // Only a signed-in administrator can create another administrator.
        if (request.getRole() == Role.ADMIN && !authz.isAdmin()) {
            throw new AccessDeniedException("Administrator accounts cannot be self-registered");
        }
        UserDTO createdUser = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PreAuthorize("@authz.selfOrAdmin(#id)")
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        // Only an administrator can approve, reject or suspend an organisation.
        if (request.getVerificationStatus() != null && !authz.isAdmin()) {
            throw new AccessDeniedException("Only an administrator can change verification status");
        }
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending-verifications")
    public ResponseEntity<List<UserDTO>> getPendingVerifications() {
        return ResponseEntity.ok(userService.getPendingVerifications());
    }
}