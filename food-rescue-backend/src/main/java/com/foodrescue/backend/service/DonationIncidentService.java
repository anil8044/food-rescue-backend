package com.foodrescue.backend.service;

import com.foodrescue.backend.dto.CreateIncidentRequest;
import com.foodrescue.backend.dto.DonationIncidentDTO;
import com.foodrescue.backend.dto.IncidentReportDTO;
import com.foodrescue.backend.dto.ResolveIncidentRequest;
import com.foodrescue.backend.model.*;
import com.foodrescue.backend.repository.DonationIncidentRepository;
import com.foodrescue.backend.repository.DonationRepository;
import com.foodrescue.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service layer for food-safety/quality incident flagging and resolution.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DonationIncidentService {

    private final DonationIncidentRepository incidentRepository;
    private final DonationRepository donationRepository;
    private final UserRepository userRepository;

    /**
     * Get all incidents (admin dashboard default view), most recent first.
     */
    public List<DonationIncidentDTO> getAllIncidents() {
        return incidentRepository.findAllByOrderByReportedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a single incident by ID.
     */
    public DonationIncidentDTO getIncidentById(Long id) {
        DonationIncident incident = findEntity(id);
        return toDTO(incident);
    }

    /**
     * Get incidents filtered by status (e.g. OPEN ones needing admin follow-up).
     */
    public List<DonationIncidentDTO> getIncidentsByStatus(IncidentStatus status) {
        return incidentRepository.findByStatusOrderByReportedAtDesc(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all incidents raised against a specific donation.
     */
    public List<DonationIncidentDTO> getIncidentsByDonation(Long donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donation not found with ID: " + donationId));

        return incidentRepository.findByDonationOrderByReportedAtDesc(donation).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Flag a new incident against a donation.
     * Only recipient organisations can flag an incident.
     */
    public DonationIncidentDTO createIncident(Long donationId, Long reportedByUserId, CreateIncidentRequest request) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donation not found with ID: " + donationId));

        User reportedBy = userRepository.findById(reportedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + reportedByUserId));

        if (!Role.RECIPIENT_ORG.equals(reportedBy.getRole())) {
            throw new RuntimeException("Only recipient organisations can flag an incident");
        }

        DonationIncident incident = new DonationIncident();
        incident.setDonation(donation);
        incident.setReportedBy(reportedBy);
        incident.setDescription(request.getDescription());
        incident.setSeverity(request.getSeverity());
        // status defaults to OPEN via @PrePersist

        DonationIncident saved = incidentRepository.save(incident);
        return toDTO(saved);
    }

    /**
     * Admin marks an incident as resolved.
     */
    public DonationIncidentDTO resolveIncident(Long id, ResolveIncidentRequest request) {
        DonationIncident incident = findEntity(id);

        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolvedAt(Instant.now());
        incident.setResolutionNotes(request.getResolutionNotes());

        DonationIncident updated = incidentRepository.save(incident);
        return toDTO(updated);
    }

    /**
     * Admin updates an incident's status (e.g. moving it to UNDER_REVIEW).
     */
    public DonationIncidentDTO updateIncidentStatus(Long id, IncidentStatus newStatus) {
        DonationIncident incident = findEntity(id);
        incident.setStatus(newStatus);

        if (IncidentStatus.RESOLVED.equals(newStatus) && incident.getResolvedAt() == null) {
            incident.setResolvedAt(Instant.now());
        }

        DonationIncident updated = incidentRepository.save(incident);
        return toDTO(updated);
    }

    /**
     * Build a simple incident report over a date range, e.g. for a regulator
     * conversation with SA Health, showing counts by severity and status.
     */
    public IncidentReportDTO getIncidentReport(Instant from, Instant to) {
        List<DonationIncident> incidents = incidentRepository
                .findByReportedAtBetweenOrderByReportedAtDesc(from, to);

        Map<String, Long> bySeverity = incidents.stream()
                .collect(Collectors.groupingBy(i -> i.getSeverity().name(), Collectors.counting()));

        Map<String, Long> byStatus = incidents.stream()
                .collect(Collectors.groupingBy(i -> i.getStatus().name(), Collectors.counting()));

        List<DonationIncidentDTO> incidentDTOs = incidents.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return new IncidentReportDTO(from, to, incidents.size(), bySeverity, byStatus, incidentDTOs);
    }

    private DonationIncident findEntity(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found with ID: " + id));
    }

    private DonationIncidentDTO toDTO(DonationIncident incident) {
        return new DonationIncidentDTO(
                incident.getId(),
                incident.getDonation().getId(),
                incident.getDonation().getTitle(),
                incident.getReportedBy().getId(),
                incident.getReportedBy().getFullName(),
                incident.getDescription(),
                incident.getSeverity(),
                incident.getStatus(),
                incident.getReportedAt(),
                incident.getResolvedAt(),
                incident.getResolutionNotes()
        );
    }
}