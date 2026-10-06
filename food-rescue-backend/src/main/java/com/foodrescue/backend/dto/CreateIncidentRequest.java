package com.foodrescue.backend.dto;

import com.foodrescue.backend.model.IncidentSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    private String description;

    @NotNull(message = "Severity is required")
    private IncidentSeverity severity;
}
