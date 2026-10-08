package com.foodrescue.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for an administrator adding a note to an incident.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddIncidentNoteRequest {

    @NotBlank(message = "A note is required")
    @Size(max = 1000, message = "A note must be 1000 characters or fewer")
    private String note;
}