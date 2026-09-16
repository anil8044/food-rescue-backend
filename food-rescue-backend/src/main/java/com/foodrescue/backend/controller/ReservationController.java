package com.foodrescue.backend.controller;

import com.foodrescue.backend.dto.ReservationDTO;
import com.foodrescue.backend.dto.CreateReservationRequest;
import com.foodrescue.backend.model.ReservationStatus;
import com.foodrescue.backend.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for reservation management endpoints.
 */
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * GET /api/reservations - Get all reservations
     */
    @GetMapping
    public ResponseEntity<List<ReservationDTO>> getAllReservations() {
        List<ReservationDTO> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }

    /**
     * GET /api/reservations/{id} - Get reservation by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReservationDTO> getReservationById(@PathVariable Long id) {
        try {
            ReservationDTO reservation = reservationService.getReservationById(id);
            return ResponseEntity.ok(reservation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/reservations/recipient/{recipientOrgId} - Get reservations for a recipient org
     */
    @GetMapping("/recipient/{recipientOrgId}")
    public ResponseEntity<List<ReservationDTO>> getRecipientReservations(
            @PathVariable Long recipientOrgId) {
        try {
            List<ReservationDTO> reservations = reservationService.getRecipientReservations(recipientOrgId);
            return ResponseEntity.ok(reservations);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/reservations - Create a new reservation
     */
    @PostMapping
    public ResponseEntity<ReservationDTO> createReservation(
            @RequestParam Long recipientOrgId,
            @Valid @RequestBody CreateReservationRequest request) {
        try {
            ReservationDTO createdReservation = reservationService.createReservation(recipientOrgId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReservation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET /api/reservations/status/{status} - Get reservations by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ReservationDTO>> getReservationsByStatus(
            @PathVariable ReservationStatus status) {
        List<ReservationDTO> reservations = reservationService.getReservationsByStatus(status);
        return ResponseEntity.ok(reservations);
    }

    /**
     * PATCH /api/reservations/{id}/status - Update reservation status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ReservationDTO> updateReservationStatus(
            @PathVariable Long id,
            @RequestParam ReservationStatus status) {
        try {
            ReservationDTO updatedReservation = reservationService.updateReservationStatus(id, status);
            return ResponseEntity.ok(updatedReservation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/reservations/{id} - Cancel a reservation
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {
        try {
            reservationService.cancelReservation(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
