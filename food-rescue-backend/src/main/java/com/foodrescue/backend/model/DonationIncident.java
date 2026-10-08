package com.foodrescue.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * A food-safety or quality incident flagged against a specific donation by the
 * recipient organisation that reserved or collected it. Requirements confirmed by
 * the host organisation (South Australian Food Rescue Network) on 8 Oct 2026.
 */
@Entity
@Table(name = "donation_incident")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DonationIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "donation_id", nullable = false)
    private Donation donation;

    /** The user who raised the flag: a member of the recipient organisation that received the food. */
    @ManyToOne(optional = false)
    @JoinColumn(name = "reported_by_id", nullable = false)
    private User reportedBy;

    /** The reporter's role in their organisation, e.g. "Kitchen manager". Optional. */
    @Column(length = 100)
    private String reporterRole;

    @NotBlank
    @Column(nullable = false, length = 1000)
    private String description;

    /** Optional extra observations from the reporter. */
    @Column(length = 1000)
    private String additionalNotes;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus status;

    @Column(nullable = false, updatable = false)
    private Instant reportedAt;

    private Instant resolvedAt;

    /** What was done to resolve it. Required when an administrator resolves the incident. */
    @Column(length = 1000)
    private String resolutionNotes;

    /** Optional note about any follow-up with the donor, recorded on resolution. */
    @Column(length = 1000)
    private String donorFollowUp;

    /** Notes added by administrators. Each note is appended with its date and never overwritten. */
    @Column(length = 4000)
    private String adminNotes;

    @PrePersist
    void onCreate() {
        this.reportedAt = Instant.now();
        if (this.status == null) {
            this.status = IncidentStatus.OPEN;
        }
    }
}