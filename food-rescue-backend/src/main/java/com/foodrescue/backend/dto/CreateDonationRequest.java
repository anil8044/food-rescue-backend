package com.foodrescue.backend.dto;

import com.foodrescue.backend.model.FoodCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Request payload for creating a new donation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateDonationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Category is required")
    private FoodCategory category;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @NotBlank(message = "Quantity unit is required")
    private String quantityUnit;

    private String dietaryInfo;

    private String storageInfo;

    @NotNull(message = "Expiry date/time is required")
    private Instant expiryDateTime;

    @NotNull(message = "Collection deadline is required")
    private Instant collectionDeadline;

    private String pickupAddress;
}
