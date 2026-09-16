package com.foodrescue.backend.dto;

import com.foodrescue.backend.model.Role;
import com.foodrescue.backend.model.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Data transfer object for User response. Excludes password hash for security.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String organisationName;
    private String phoneNumber;
    private String address;
    private VerificationStatus verificationStatus;
    private Instant createdAt;
}
