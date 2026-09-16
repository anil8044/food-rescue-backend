package com.foodrescue.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * A single food donation published by a donor. Covers the fields called out
 * in the project scope: category, quantity, expiry/collection deadline,
 * dietary and storage information.
 */
@Entity
@Table(name = "donation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FoodCategory category;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Double quantity;

    /** e.g. "kg", "boxes", "meals", "litres" */
    @NotBlank
    @Column(nullable = false)
    private String quantityUnit;

    /** Free-text dietary information, e.g. "contains nuts", "vegan", "halal". */
    @Column(length = 500)
    private String dietaryInfo;

    /** Free-text storage requirements, e.g. "keep refrigerated below 5°C". */
    @Column(length = 500)
    private String storageInfo;

    @NotNull
    @Column(nullable = false)
    private Instant expiryDateTime;

    @NotNull
    @Column(nullable = false)
    private Instant collectionDeadline;

    private String pickupAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
        if (this.status == null) {
            this.status = DonationStatus.AVAILABLE;
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
