package com.foodrescue.backend.controller;

import com.foodrescue.backend.dto.CreateDonationRequest;
import com.foodrescue.backend.dto.DonationDTO;
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
 * Errors are handled centrally by GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;

    @GetMapping
    public ResponseEntity<List<DonationDTO>> getAllDonations() {
        return ResponseEntity.ok(donationService.getAllDonations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationDTO> getDonationById(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.getDonationById(id));
    }

    @GetMapping("/available")
    public ResponseEntity<List<DonationDTO>> getAvailableDonations() {
        return ResponseEntity.ok(donationService.getAvailableDonations());
    }

    @GetMapping("/donor/{donorId}")
    public ResponseEntity<List<DonationDTO>> getDonorDonations(@PathVariable Long donorId) {
        return ResponseEntity.ok(donationService.getDonorDonations(donorId));
    }

    @PostMapping
    public ResponseEntity<DonationDTO> createDonation(
            @RequestParam Long donorId,
            @Valid @RequestBody CreateDonationRequest request) {
        DonationDTO created = donationService.createDonation(donorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DonationDTO>> getDonationsByStatus(@PathVariable DonationStatus status) {
        return ResponseEntity.ok(donationService.getDonationsByStatus(status));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DonationDTO> updateDonationStatus(
            @PathVariable Long id,
            @RequestParam DonationStatus status) {
        return ResponseEntity.ok(donationService.updateDonationStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonation(@PathVariable Long id) {
        donationService.deleteDonation(id);
        return ResponseEntity.noContent().build();
    }
}