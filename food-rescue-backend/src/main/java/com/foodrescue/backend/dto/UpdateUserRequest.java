package com.foodrescue.backend.dto;

import com.foodrescue.backend.model.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for updating an existing user.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    private String fullName;

    private String organisationName;

    private String phoneNumber;

    private String address;

    private VerificationStatus verificationStatus;
}
