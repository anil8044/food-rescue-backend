package com.foodrescue.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * In-app notification record. Also used as the source of truth for what
 * gets emailed out (e.g. via SendGrid) - see Communications/Notifications
 * requirement in the project scope.
 */
@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "recipient_user_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, length = 500)
    private String message;

    /** Optional link back to the relevant donation, if applicable. */
    private Long relatedDonationId;

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public enum NotificationType {
        NEW_DONATION_AVAILABLE,
        RESERVATION_CONFIRMED,
        DONATION_EXPIRING_SOON,
        DONATION_COLLECTED,
        RECIPIENT_ORG_VERIFIED
    }
}
