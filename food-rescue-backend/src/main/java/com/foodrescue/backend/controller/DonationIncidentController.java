package com.foodrescue.backend.controller;

import com.foodrescue.backend.dto.CreateIncidentRequest;
import com.foodrescue.backend.dto.DonationIncidentDTO;
import com.foodrescue.backend.dto.IncidentReportDTO;
import com.foodrescue.backend.dto.ResolveIncidentRequest;
import com.foodrescue.backend.model.IncidentStatus;
import com.foodrescue.backend.service.DonationIncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/**
 * REST controller for food-safety/quality incident flagging and resolution.
 *
 * Added following a client-requested scope change: recipient organisations
 * can flag a problem with a donation, and admins can review, resolve and
 * report on these incidents (see host organisation correspondence re:
 * SA Health food-handling and record-keeping requirements).
 */
@RestController
@RequiredArgsConstructor
public class DonationIncidentController {

    private final DonationIncidentService incidentService;

    /**
     * POST /api/donations/{donationId}/incidents - Flag a new incident against a donation
     */
    @PostMapping("/api/donations/{donationId}/incidents")
    public ResponseEntity<DonationIncidentDTO> createIncident(
            @PathVariable Long donationId,
            @RequestParam Long reportedByUserId,
            @Valid @RequestBody CreateIncidentRequest request) {
        try {
            DonationIncidentDTO created = incidentService.createIncident(donationId, reportedByUserId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET /api/donations/{donationId}/incidents - Get all incidents for a specific donation
     */
    @GetMapping("/api/donations/{donationId}/incidents")
    public ResponseEntity<List<DonationIncidentDTO>> getIncidentsForDonation(@PathVariable Long donationId) {
        try {
            List<DonationIncidentDTO> incidents = incidentService.getIncidentsByDonation(donationId);
            return ResponseEntity.ok(incidents);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/incidents - Get all incidents (admin dashboard default view)
     */
    @GetMapping("/api/incidents")
    public ResponseEntity<List<DonationIncidentDTO>> getAllIncidents() {
        List<DonationIncidentDTO> incidents = incidentService.getAllIncidents();
        return ResponseEntity.ok(incidents);
    }

    /**
     * GET /api/incidents/{id} - Get a specific incident
     */
    @GetMapping("/api/incidents/{id}")
    public ResponseEntity<DonationIncidentDTO> getIncidentById(@PathVariable Long id) {
        try {
            DonationIncidentDTO incident = incidentService.getIncidentById(id);
            return ResponseEntity.ok(incident);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/incidents/status/{status} - Get incidents filtered by status
     */
    @GetMapping("/api/incidents/status/{status}")
    public ResponseEntity<List<DonationIncidentDTO>> getIncidentsByStatus(@PathVariable IncidentStatus status) {
        List<DonationIncidentDTO> incidents = incidentService.getIncidentsByStatus(status);
        return ResponseEntity.ok(incidents);
    }

    /**
     * PATCH /api/incidents/{id}/status - Update an incident's status (e.g. to UNDER_REVIEW)
     */
    @PatchMapping("/api/incidents/{id}/status")
    public ResponseEntity<DonationIncidentDTO> updateIncidentStatus(
            @PathVariable Long id,
            @RequestParam IncidentStatus status) {
        try {
            DonationIncidentDTO updated = incidentService.updateIncidentStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PATCH /api/incidents/{id}/resolve - Admin resolves an incident with notes
     */
    @PatchMapping("/api/incidents/{id}/resolve")
    public ResponseEntity<DonationIncidentDTO> resolveIncident(
            @PathVariable Long id,
            @RequestBody ResolveIncidentRequest request) {
        try {
            DonationIncidentDTO resolved = incidentService.resolveIncident(id, request);
            return ResponseEntity.ok(resolved);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/incidents/report?from=2026-09-01T00:00:00Z&to=2026-09-30T23:59:59Z
     * Simple incident summary over a date range, e.g. for a regulator conversation.
     * Dates must be ISO-8601 instant strings (e.g. 2026-09-01T00:00:00Z).
     */
    @GetMapping("/api/incidents/report")
    public ResponseEntity<IncidentReportDTO> getIncidentReport(
            @RequestParam String from,
            @RequestParam String to) {
        try {
            Instant fromInstant = Instant.parse(from);
            Instant toInstant = Instant.parse(to);
            IncidentReportDTO report = incidentService.getIncidentReport(fromInstant, toInstant);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
