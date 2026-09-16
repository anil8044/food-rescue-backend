package com.foodrescue.backend.dto;

import com.foodrescue.backend.model.DonationStatus;
import com.foodrescue.backend.model.FoodCategory;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Data transfer object for Donation response.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DonationDTO {

    private Long id;
    private Long donorId;
    private String donorName;
    private String title;
    private String description;
    private FoodCategory category;
    private Double quantity;
    private String quantityUnit;
    private String dietaryInfo;
    private String storageInfo;
    private Instant expiryDateTime;
    private Instant collectionDeadline;
    private String pickupAddress;
    private DonationStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
