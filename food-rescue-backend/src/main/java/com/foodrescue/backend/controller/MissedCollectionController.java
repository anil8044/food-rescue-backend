package com.foodrescue.backend.controller;

import com.foodrescue.backend.dto.MissedCollectionSummaryDTO;
import com.foodrescue.backend.service.MissedCollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Admin endpoint for reservations that were never collected.
 */
@RestController
@RequestMapping("/api/missed-collections")
@RequiredArgsConstructor
public class MissedCollectionController {

    private final MissedCollectionService missedCollectionService;

    /**
     * GET /api/missed-collections - recipient organisations with missed collections, worst first
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<MissedCollectionSummaryDTO>> getSummary() {
        return ResponseEntity.ok(missedCollectionService.getSummary());
    }
}