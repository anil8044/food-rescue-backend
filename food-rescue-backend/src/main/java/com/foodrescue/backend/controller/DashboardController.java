package com.foodrescue.backend.controller;

import com.foodrescue.backend.dto.DashboardStatsDTO;
import com.foodrescue.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for dashboard and analytics endpoints.
 * Errors are handled centrally by GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AnalyticsService analyticsService;

    /**
     * GET /api/dashboard/stats - Get overall dashboard statistics
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    /**
     * GET /api/dashboard/user/{userId}/stats - Get user-specific statistics
     */
    @PreAuthorize("@authz.selfOrAdmin(#userId)")
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable Long userId) {
        return ResponseEntity.ok(analyticsService.getUserStats(userId));
    }
}