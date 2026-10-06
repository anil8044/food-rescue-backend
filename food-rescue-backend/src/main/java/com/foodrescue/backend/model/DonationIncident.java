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
 * A food-safety or quality incident flagged against a specific donation,
 * e.g. an expiry-date mismatch discovered at collection. Added following
 * a client-requested scope change (see host organisation correspondence
 * re: SA Health food-handling and record-keeping requirements).
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

    /** The user who raised the flag - typically the recipient organisation that collected it. */
    @ManyToOne(optional = false)
    @JoinColumn(name = "reported_by_id", nullable = false)
    private User reportedBy;

    @NotBlank
    @Column(nullable = false, length = 1000)
    private String description;

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

    @Column(length = 1000)
    private String resolutionNotes;

    @PrePersist
    void onCreate() {
        this.reportedAt = Instant.now();
        if (this.status == null) {
            this.status = IncidentStatus.OPEN;
        }
    }
}
