package com.foodrescue.backend.dto;

import com.foodrescue.backend.model.IncidentSeverity;
import com.foodrescue.backend.model.IncidentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Response payload representing a donation incident.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DonationIncidentDTO {

    private Long id;
    private Long donationId;
    private String donationTitle;
    private String donationDescription;
    private Long donorId;
    private String donorName;
    private String donorOrganisation;
    private Long reportedById;
    private String reportedByName;
    private String reportedByOrganisation;
    private String reporterRole;
    private String description;
    private String additionalNotes;
    private IncidentSeverity severity;
    private IncidentStatus status;
    private Instant reportedAt;
    private Instant resolvedAt;
    private String resolutionNotes;
    private String donorFollowUp;
    private String adminNotes;
}