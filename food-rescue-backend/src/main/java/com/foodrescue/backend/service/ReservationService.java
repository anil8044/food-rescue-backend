package com.foodrescue.backend.service;

import com.foodrescue.backend.dto.ReservationDTO;
import com.foodrescue.backend.dto.CreateReservationRequest;
import com.foodrescue.backend.model.*;
import com.foodrescue.backend.repository.DonationRepository;
import com.foodrescue.backend.repository.ReservationRepository;
import com.foodrescue.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for reservation operations.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final DonationRepository donationRepository;
    private final UserRepository userRepository;

    /**
     * Get all reservations.
     */
    public List<ReservationDTO> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a reservation by ID.
     */
    public ReservationDTO getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Reservation not found with ID: " + id));

        return toDTO(reservation);
    }

    /**
     * Get all reservations for a recipient organization.
     */
    public List<ReservationDTO> getRecipientReservations(Long recipientOrgId) {

        User recipientOrg = userRepository.findById(recipientOrgId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Recipient org not found with ID: " + recipientOrgId));

        return reservationRepository
                .findByRecipientOrgOrderByReservedAtDesc(recipientOrg)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new reservation.
     */
    public ReservationDTO createReservation(
            Long recipientOrgId,
            CreateReservationRequest request) {

        // Find recipient organisation
        User recipientOrg = userRepository.findById(recipientOrgId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Recipient org not found with ID: " + recipientOrgId));

        // Make sure the user is actually a recipient organisation
        if (!recipientOrg.getRole().equals(Role.RECIPIENT_ORG)) {
            throw new RuntimeException(
                    "User is not a recipient organisation");
        }

        // Check recipient verification status
        if (!VerificationStatus.APPROVED.equals(
                recipientOrg.getVerificationStatus())) {

            throw new RuntimeException(
                    "Recipient organisation must be approved before making reservations");
        }

        // Find donation
        Donation donation = donationRepository.findById(request.getDonationId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Donation not found with ID: "
                                        + request.getDonationId()));

        // Check donation is available
        if (!DonationStatus.AVAILABLE.equals(donation.getStatus())) {
            throw new RuntimeException(
                    "Donation is not available for reservation. Current status: "
                            + donation.getStatus());
        }

        // Check if THIS SPECIFIC donation already has a reservation
        if (reservationRepository.findByDonation(donation).isPresent()) {
            throw new RuntimeException(
                    "Donation already has an existing reservation");
        }

        // Create reservation
        Reservation reservation = new Reservation();

        reservation.setDonation(donation);
        reservation.setRecipientOrg(recipientOrg);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setScheduledPickupTime(
                request.getScheduledPickupTime());

        // Update donation status
        donation.setStatus(DonationStatus.RESERVED);
        donationRepository.save(donation);

        // Save reservation
        Reservation savedReservation =
                reservationRepository.save(reservation);

        return toDTO(savedReservation);
    }

    /**
     * Update reservation status.
     */
    public ReservationDTO updateReservationStatus(
            Long id,
            ReservationStatus newStatus) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Reservation not found with ID: " + id));

        reservation.setStatus(newStatus);

        /*
         * If reservation is collected,
         * mark the donation as collected and record collection time.
         */
        if (ReservationStatus.COLLECTED.equals(newStatus)) {

            reservation.getDonation()
                    .setStatus(DonationStatus.COLLECTED);

            donationRepository.save(reservation.getDonation());

            reservation.setCollectedAt(Instant.now());
        }

        /*
         * If reservation is cancelled,
         * make the donation available again.
         */
        if (ReservationStatus.CANCELLED.equals(newStatus)) {

            reservation.getDonation()
                    .setStatus(DonationStatus.AVAILABLE);

            donationRepository.save(reservation.getDonation());
        }

        Reservation updatedReservation =
                reservationRepository.save(reservation);

        return toDTO(updatedReservation);
    }

    /**
     * Cancel a reservation.
     */
    public void cancelReservation(Long id) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Reservation not found with ID: " + id));

        // Make donation available again
        reservation.getDonation()
                .setStatus(DonationStatus.AVAILABLE);

        donationRepository.save(reservation.getDonation());

        // Mark reservation as cancelled
        reservation.setStatus(ReservationStatus.CANCELLED);

        reservationRepository.save(reservation);
    }

    /**
     * Get reservations by status.
     */
    public List<ReservationDTO> getReservationsByStatus(
            ReservationStatus status) {

        return reservationRepository
                .findByStatus(status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert Reservation entity to ReservationDTO.
     */
    private ReservationDTO toDTO(Reservation reservation) {

        return new ReservationDTO(
                reservation.getId(),
                reservation.getDonation().getId(),
                reservation.getDonation().getTitle(),
                reservation.getRecipientOrg().getId(),
                reservation.getRecipientOrg().getFullName(),
                reservation.getStatus(),
                reservation.getScheduledPickupTime(),
                reservation.getReservedAt(),
                reservation.getCollectedAt()
        );
    }
}