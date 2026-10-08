package com.foodrescue.backend.service;

import com.foodrescue.backend.dto.AddIncidentNoteRequest;
import com.foodrescue.backend.dto.CreateIncidentRequest;
import com.foodrescue.backend.dto.DonationIncidentDTO;
import com.foodrescue.backend.dto.IncidentReportDTO;
import com.foodrescue.backend.dto.ResolveIncidentRequest;
import com.foodrescue.backend.model.*;
import com.foodrescue.backend.repository.DonationIncidentRepository;
import com.foodrescue.backend.repository.DonationRepository;
import com.foodrescue.backend.repository.ReservationRepository;
import com.foodrescue.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
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

    private static final int ADMIN_NOTES_LIMIT = 4000;

    private final DonationIncidentRepository incidentRepository;
    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationService notificationService;

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
        return toDTO(findEntity(id));
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
     * Only the recipient organisation that reserved or collected the donation can flag it.
     */
    public DonationIncidentDTO createIncident(Long donationId, Long reportedByUserId, CreateIncidentRequest request) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donation not found with ID: " + donationId));

        User reportedBy = userRepository.findById(reportedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + reportedByUserId));

        if (!Role.RECIPIENT_ORG.equals(reportedBy.getRole())) {
            throw new RuntimeException("Only recipient organisations can flag an incident");
        }

        // The reporter must hold a (non-cancelled) reservation on this specific donation
        boolean reservedOrCollected = reservationRepository
                .existsByDonationAndRecipientOrgAndStatusNot(donation, reportedBy, ReservationStatus.CANCELLED);
        if (!reservedOrCollected) {
            throw new RuntimeException(
                    "Only the recipient organisation that reserved or collected this donation can flag an incident");
        }

        DonationIncident incident = new DonationIncident();
        incident.setDonation(donation);
        incident.setReportedBy(reportedBy);
        incident.setReporterRole(blankToNull(request.getReporterRole()));
        incident.setDescription(request.getDescription().trim());
        incident.setAdditionalNotes(blankToNull(request.getAdditionalNotes()));
        incident.setSeverity(request.getSeverity());
        // status defaults to OPEN and reportedAt is set via @PrePersist

        DonationIncident saved = incidentRepository.save(incident);

        // Tell every administrator
        notificationService.notifyAdmins(
                Notification.NotificationType.INCIDENT_FLAGGED,
                notificationService.displayName(reportedBy) + " flagged a "
                        + request.getSeverity().name().toLowerCase() + "-severity problem with \""
                        + donation.getTitle() + "\".",
                donation.getId());

        return toDTO(saved);
    }

    /**
     * Admin marks an incident as resolved. A resolution note is required, and the
     * resolution date defaults to now but can be confirmed or changed.
     */
    public DonationIncidentDTO resolveIncident(Long id, ResolveIncidentRequest request) {
        DonationIncident incident = findEntity(id);

        if (IncidentStatus.RESOLVED.equals(incident.getStatus())) {
            throw new RuntimeException("This incident has already been resolved");
        }

        Instant resolvedOn = request.getResolvedOn() != null ? request.getResolvedOn() : Instant.now();
        if (resolvedOn.isAfter(Instant.now().plusSeconds(300))) {
            throw new RuntimeException("The resolution date can't be in the future");
        }
        if (resolvedOn.isBefore(incident.getReportedAt())) {
            throw new RuntimeException("The resolution date can't be before the incident was reported");
        }

        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolvedAt(resolvedOn);
        incident.setResolutionNotes(request.getResolutionNotes().trim());
        incident.setDonorFollowUp(blankToNull(request.getDonorFollowUp()));

        DonationIncident updated = incidentRepository.save(incident);

        notifyReporterResolved(updated);

        return toDTO(updated);
    }

    /**
     * Admin updates an incident's status, for example moving it to UNDER_REVIEW.
     * Resolving goes through resolveIncident, and a resolved incident can't be changed.
     */
    public DonationIncidentDTO updateIncidentStatus(Long id, IncidentStatus newStatus) {
        DonationIncident incident = findEntity(id);

        if (IncidentStatus.RESOLVED.equals(newStatus)) {
            throw new RuntimeException("Use the resolve action and enter a resolution note to resolve an incident");
        }
        if (IncidentStatus.RESOLVED.equals(incident.getStatus())) {
            throw new RuntimeException("A resolved incident can't be changed");
        }

        incident.setStatus(newStatus);
        return toDTO(incidentRepository.save(incident));
    }

    /**
     * Admin adds a note. Notes are appended with the date and never overwritten,
     * and can be added to resolved incidents too.
     */
    public DonationIncidentDTO addAdminNote(Long id, AddIncidentNoteRequest request) {
        DonationIncident incident = findEntity(id);

        String line = "[" + LocalDate.now(ZoneId.of("Australia/Adelaide")) + "] " + request.getNote().trim();
        String combined = incident.getAdminNotes() == null ? line : incident.getAdminNotes() + "\n" + line;
        if (combined.length() > ADMIN_NOTES_LIMIT) {
            throw new RuntimeException("The notes for this incident are full");
        }

        incident.setAdminNotes(combined);
        return toDTO(incidentRepository.save(incident));
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

    /**
     * Tell the organisation that flagged an incident that it has been resolved.
     */
    private void notifyReporterResolved(DonationIncident incident) {
        notificationService.notifyUser(
                incident.getReportedBy(),
                Notification.NotificationType.INCIDENT_RESOLVED,
                "Your report about \"" + incident.getDonation().getTitle() + "\" has been resolved.",
                incident.getDonation().getId());
    }

    private DonationIncident findEntity(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found with ID: " + id));
    }

    private String blankToNull(String text) {
        return (text == null || text.isBlank()) ? null : text.trim();
    }

    private DonationIncidentDTO toDTO(DonationIncident incident) {
        Donation donation = incident.getDonation();
        User donor = donation.getDonor();
        User reporter = incident.getReportedBy();

        return new DonationIncidentDTO(
                incident.getId(),
                donation.getId(),
                donation.getTitle(),
                donation.getDescription(),
                donor.getId(),
                donor.getFullName(),
                donor.getOrganisationName(),
                reporter.getId(),
                reporter.getFullName(),
                reporter.getOrganisationName(),
                incident.getReporterRole(),
                incident.getDescription(),
                incident.getAdditionalNotes(),
                incident.getSeverity(),
                incident.getStatus(),
                incident.getReportedAt(),
                incident.getResolvedAt(),
                incident.getResolutionNotes(),
                incident.getDonorFollowUp(),
                incident.getAdminNotes()
        );
    }
}