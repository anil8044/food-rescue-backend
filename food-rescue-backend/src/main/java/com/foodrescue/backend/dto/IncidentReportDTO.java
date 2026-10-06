package com.foodrescue.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Summary of incidents over a date range - used by the admin dashboard to
 * pull together a simple record of incidents for regulator conversations
 * (e.g. with SA Health).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IncidentReportDTO {

    private Instant from;
    private Instant to;
    private long totalIncidents;
    private Map<String, Long> incidentsBySeverity;
    private Map<String, Long> incidentsByStatus;
    private List<DonationIncidentDTO> incidents;
}
