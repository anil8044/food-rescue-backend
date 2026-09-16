package com.foodrescue.backend.service;

import com.foodrescue.backend.dto.DonationDTO;
import com.foodrescue.backend.dto.CreateDonationRequest;
import com.foodrescue.backend.model.Donation;
import com.foodrescue.backend.model.DonationStatus;
import com.foodrescue.backend.model.User;
import com.foodrescue.backend.repository.DonationRepository;
import com.foodrescue.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for donation operations.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;

    /**
     * Get all donations.
     */
    public List<DonationDTO> getAllDonations() {
        return donationRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a donation by ID.
     */
    public DonationDTO getDonationById(Long id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation not found with ID: " + id));
        return toDTO(donation);
    }

    /**
     * Get all available donations (for recipient browsing).
     */
    public List<DonationDTO> getAvailableDonations() {
        return donationRepository.findByStatusOrderByCollectionDeadlineAsc(DonationStatus.AVAILABLE)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a donor's donation history.
     */
    public List<DonationDTO> getDonorDonations(Long donorId) {
        User donor = userRepository.findById(donorId)
                .orElseThrow(() -> new RuntimeException("Donor not found with ID: " + donorId));

        return donationRepository.findByDonorOrderByCreatedAtDesc(donor).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new donation.
     */
    public DonationDTO createDonation(Long donorId, CreateDonationRequest request) {
        User donor = userRepository.findById(donorId)
                .orElseThrow(() -> new RuntimeException("Donor not found with ID: " + donorId));

        Donation donation = new Donation();
        donation.setDonor(donor);
        donation.setTitle(request.getTitle());
        donation.setDescription(request.getDescription());
        donation.setCategory(request.getCategory());
        donation.setQuantity(request.getQuantity());
        donation.setQuantityUnit(request.getQuantityUnit());
        donation.setDietaryInfo(request.getDietaryInfo());
        donation.setStorageInfo(request.getStorageInfo());
        donation.setExpiryDateTime(request.getExpiryDateTime());
        donation.setCollectionDeadline(request.getCollectionDeadline());
        donation.setPickupAddress(request.getPickupAddress());
        donation.setStatus(DonationStatus.AVAILABLE);

        Donation savedDonation = donationRepository.save(donation);
        return toDTO(savedDonation);
    }

    /**
     * Update donation status.
     */
    public DonationDTO updateDonationStatus(Long id, DonationStatus newStatus) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation not found with ID: " + id));

        donation.setStatus(newStatus);
        Donation updatedDonation = donationRepository.save(donation);
        return toDTO(updatedDonation);
    }

    /**
     * Delete a donation.
     */
    public void deleteDonation(Long id) {
        if (!donationRepository.existsById(id)) {
            throw new RuntimeException("Donation not found with ID: " + id);
        }
        donationRepository.deleteById(id);
    }

    /**
     * Get donations by status.
     */
    public List<DonationDTO> getDonationsByStatus(DonationStatus status) {
        return donationRepository.findByStatus(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Expire donations past their collection deadline (scheduled job).
     */
    public int expireOverdueDonations() {
        List<Donation> overdue = donationRepository
                .findByStatusAndCollectionDeadlineBefore(DonationStatus.AVAILABLE, Instant.now());

        overdue.forEach(d -> d.setStatus(DonationStatus.EXPIRED));
        donationRepository.saveAll(overdue);

        return overdue.size();
    }

    /**
     * Convert Donation entity to DonationDTO.
     */
    private DonationDTO toDTO(Donation donation) {
        return new DonationDTO(
                donation.getId(),
                donation.getDonor().getId(),
                donation.getDonor().getFullName(),
                donation.getTitle(),
                donation.getDescription(),
                donation.getCategory(),
                donation.getQuantity(),
                donation.getQuantityUnit(),
                donation.getDietaryInfo(),
                donation.getStorageInfo(),
                donation.getExpiryDateTime(),
                donation.getCollectionDeadline(),
                donation.getPickupAddress(),
                donation.getStatus(),
                donation.getCreatedAt(),
                donation.getUpdatedAt()
        );
    }
}
