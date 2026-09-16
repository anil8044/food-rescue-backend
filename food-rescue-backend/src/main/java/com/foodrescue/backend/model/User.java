package com.foodrescue.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Represents any registered user of the platform: a donor (supermarket, cafe,
 * farm, event organiser), a recipient community/charity organisation, or an
 * administrator from the South Australian Food Rescue Network.
 *
 * Recipient organisations must be verified (see {@link VerificationStatus})
 * before they can reserve donations - this satisfies the "user verification"
 * requirement in the project scope.
 */
@Entity
@Table(name = "app_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String fullName;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    /** Stored as a BCrypt hash - never persist plain-text passwords. */
    @NotBlank
    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /**
     * Organisation name - used for donors (e.g. "Woolworths Norwood") and
     * recipient orgs (e.g. "Adelaide Community Kitchen"). Null for admins.
     */
    private String organisationName;

    private String phoneNumber;

    private String address;

    /**
     * Only meaningful for RECIPIENT_ORG accounts. Donors and admins are
     * left null / are implicitly trusted (admins are created manually by
     * the Food Rescue Network, donors do not need approval to list food).
     */
    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        if (this.role == Role.RECIPIENT_ORG && this.verificationStatus == null) {
            this.verificationStatus = VerificationStatus.PENDING;
        }
    }
}
