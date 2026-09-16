package com.foodrescue.backend.controller;

import com.foodrescue.backend.dto.DonationDTO;
import com.foodrescue.backend.dto.CreateDonationRequest;
import com.foodrescue.backend.model.DonationStatus;
import com.foodrescue.backend.service.DonationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for donation management endpoints.
 */
@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;

    /**
     * GET /api/donations - Get all donations
     */
    @GetMapping
    public ResponseEntity<List<DonationDTO>> getAllDonations() {
        List<DonationDTO> donations = donationService.getAllDonations();
        return ResponseEntity.ok(donations);
    }

    /**
     * GET /api/donations/{id} - Get donation by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<DonationDTO> getDonationById(@PathVariable Long id) {
        try {
            DonationDTO donation = donationService.getDonationById(id);
            return ResponseEntity.ok(donation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/donations/available - Get all available donations (for recipients to browse)
     */
    @GetMapping("/available")
    public ResponseEntity<List<DonationDTO>> getAvailableDonations() {
        List<DonationDTO> donations = donationService.getAvailableDonations();
        return ResponseEntity.ok(donations);
    }

    /**
     * GET /api/donations/donor/{donorId} - Get donations by a specific donor
     */
    @GetMapping("/donor/{donorId}")
    public ResponseEntity<List<DonationDTO>> getDonorDonations(@PathVariable Long donorId) {
        try {
            List<DonationDTO> donations = donationService.getDonorDonations(donorId);
            return ResponseEntity.ok(donations);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/donations - Create a new donation
     */
    @PostMapping
    public ResponseEntity<DonationDTO> createDonation(
            @RequestParam Long donorId,
            @Valid @RequestBody CreateDonationRequest request) {
        try {
            DonationDTO createdDonation = donationService.createDonation(donorId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDonation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET /api/donations/status/{status} - Get donations by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<DonationDTO>> getDonationsByStatus(@PathVariable DonationStatus status) {
        List<DonationDTO> donations = donationService.getDonationsByStatus(status);
        return ResponseEntity.ok(donations);
    }

    /**
     * PATCH /api/donations/{id}/status - Update donation status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<DonationDTO> updateDonationStatus(
            @PathVariable Long id,
            @RequestParam DonationStatus status) {
        try {
            DonationDTO updatedDonation = donationService.updateDonationStatus(id, status);
            return ResponseEntity.ok(updatedDonation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/donations/{id} - Delete a donation
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonation(@PathVariable Long id) {
        try {
            donationService.deleteDonation(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
