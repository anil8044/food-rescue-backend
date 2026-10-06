package com.foodrescue.backend.controller;

import com.foodrescue.backend.dto.CreateReservationRequest;
import com.foodrescue.backend.dto.ReservationDTO;
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
 * Errors are handled centrally by GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ResponseEntity<List<ReservationDTO>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationDTO> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    @GetMapping("/recipient/{recipientOrgId}")
    public ResponseEntity<List<ReservationDTO>> getRecipientReservations(
            @PathVariable Long recipientOrgId) {
        return ResponseEntity.ok(reservationService.getRecipientReservations(recipientOrgId));
    }

    @PostMapping
    public ResponseEntity<ReservationDTO> createReservation(
            @RequestParam Long recipientOrgId,
            @Valid @RequestBody CreateReservationRequest request) {
        ReservationDTO created = reservationService.createReservation(recipientOrgId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ReservationDTO>> getReservationsByStatus(
            @PathVariable ReservationStatus status) {
        return ResponseEntity.ok(reservationService.getReservationsByStatus(status));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ReservationDTO> updateReservationStatus(
            @PathVariable Long id,
            @RequestParam ReservationStatus status) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.noContent().build();
    }
}