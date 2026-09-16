package com.foodrescue.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Represents a recipient organisation's reservation of a donation, including
 * the scheduled pickup time. One donation has at most one active reservation
 * at a time (enforced in the service layer, not just the database).
 */
@Entity
@Table(name = "reservation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "donation_id", nullable = false, unique = true)
    private Donation donation;

    @ManyToOne(optional = false)
    @JoinColumn(name = "recipient_org_id", nullable = false)
    private User recipientOrg;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    private Instant scheduledPickupTime;

    @Column(nullable = false, updatable = false)
    private Instant reservedAt;

    private Instant collectedAt;

    @PrePersist
    void onCreate() {
        this.reservedAt = Instant.now();
        if (this.status == null) {
            this.status = ReservationStatus.PENDING;
        }
    }
}
