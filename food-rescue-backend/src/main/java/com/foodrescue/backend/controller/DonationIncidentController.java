package com.foodrescue.backend.controller;

import com.foodrescue.backend.dto.AddIncidentNoteRequest;
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
import java.time.format.DateTimeParseException;
import java.util.List;

/**
 * REST controller for food-safety/quality incident flagging and resolution.
 * Errors are handled centrally by GlobalExceptionHandler.
 */
@RestController
@RequiredArgsConstructor
public class DonationIncidentController {

    private final DonationIncidentService incidentService;

    @PostMapping("/api/donations/{donationId}/incidents")
    public ResponseEntity<DonationIncidentDTO> createIncident(
            @PathVariable Long donationId,
            @RequestParam Long reportedByUserId,
            @Valid @RequestBody CreateIncidentRequest request) {
        DonationIncidentDTO created = incidentService.createIncident(donationId, reportedByUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/api/donations/{donationId}/incidents")
    public ResponseEntity<List<DonationIncidentDTO>> getIncidentsForDonation(@PathVariable Long donationId) {
        return ResponseEntity.ok(incidentService.getIncidentsByDonation(donationId));
    }

    @GetMapping("/api/incidents")
    public ResponseEntity<List<DonationIncidentDTO>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/api/incidents/{id}")
    public ResponseEntity<DonationIncidentDTO> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @GetMapping("/api/incidents/status/{status}")
    public ResponseEntity<List<DonationIncidentDTO>> getIncidentsByStatus(@PathVariable IncidentStatus status) {
        return ResponseEntity.ok(incidentService.getIncidentsByStatus(status));
    }

    @PatchMapping("/api/incidents/{id}/status")
    public ResponseEntity<DonationIncidentDTO> updateIncidentStatus(
            @PathVariable Long id,
            @RequestParam IncidentStatus status) {
        return ResponseEntity.ok(incidentService.updateIncidentStatus(id, status));
    }

    /**
     * PATCH /api/incidents/{id}/notes - an administrator adds a note
     */
    @PatchMapping("/api/incidents/{id}/notes")
    public ResponseEntity<DonationIncidentDTO> addNote(
            @PathVariable Long id,
            @Valid @RequestBody AddIncidentNoteRequest request) {
        return ResponseEntity.ok(incidentService.addAdminNote(id, request));
    }

    /**
     * PATCH /api/incidents/{id}/resolve - resolve with a required note
     */
    @PatchMapping("/api/incidents/{id}/resolve")
    public ResponseEntity<DonationIncidentDTO> resolveIncident(
            @PathVariable Long id,
            @Valid @RequestBody ResolveIncidentRequest request) {
        return ResponseEntity.ok(incidentService.resolveIncident(id, request));
    }

    /**
     * GET /api/incidents/report?from=2026-09-01T00:00:00Z&to=2026-09-30T23:59:59Z
     * Dates must be ISO-8601 instants.
     */
    @GetMapping("/api/incidents/report")
    public ResponseEntity<IncidentReportDTO> getIncidentReport(
            @RequestParam String from,
            @RequestParam String to) {
        Instant fromInstant;
        Instant toInstant;
        try {
            fromInstant = Instant.parse(from);
            toInstant = Instant.parse(to);
        } catch (DateTimeParseException e) {
            throw new RuntimeException("Dates must be ISO-8601 instants, e.g. 2026-09-01T00:00:00Z");
        }
        return ResponseEntity.ok(incidentService.getIncidentReport(fromInstant, toInstant));
    }
}