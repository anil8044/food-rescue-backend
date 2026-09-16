package com.foodrescue.backend.dto;

import com.foodrescue.backend.model.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Data transfer object for Reservation response.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDTO {

    private Long id;
    private Long donationId;
    private String donationTitle;
    private Long recipientOrgId;
    private String recipientOrgName;
    private ReservationStatus status;
    private Instant scheduledPickupTime;
    private Instant reservedAt;
    private Instant collectedAt;
}
