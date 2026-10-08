package com.foodrescue.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Request payload for an admin resolving an incident.
 * A resolution note is required. The resolution date defaults to now.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResolveIncidentRequest {

    @NotBlank(message = "A resolution note is required")
    @Size(max = 1000, message = "The resolution note must be 1000 characters or fewer")
    private String resolutionNotes;

    /** When it was resolved. Leave out to use the current time. */
    private Instant resolvedOn;

    @Size(max = 1000, message = "The donor follow-up must be 1000 characters or fewer")
    private String donorFollowUp;
}