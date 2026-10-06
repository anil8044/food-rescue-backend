package com.foodrescue.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for an admin resolving an incident.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResolveIncidentRequest {

    private String resolutionNotes;
}
