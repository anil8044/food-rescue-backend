package com.foodrescue.backend.dto;

import com.foodrescue.backend.model.IncidentSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for flagging a food-safety/quality incident against a donation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateIncidentRequest {

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must be 1000 characters or fewer")
    private String description;

    @NotNull(message = "Severity is required")
    private IncidentSeverity severity;

    @Size(max = 100, message = "Role must be 100 characters or fewer")
    private String reporterRole;

    @Size(max = 1000, message = "Notes must be 1000 characters or fewer")
    private String additionalNotes;
}