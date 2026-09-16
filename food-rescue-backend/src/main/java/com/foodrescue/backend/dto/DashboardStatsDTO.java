package com.foodrescue.backend.dto;

import com.foodrescue.backend.model.DonationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

/**
 * Dashboard analytics statistics.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    private long totalDonations;
    private long activeDonations;
    private long totalReservations;
    private long completedReservations;
    private long totalUsers;
    private long verifiedRecipients;
    private long pendingVerifications;
    private Map<DonationStatus, Long> donationsByStatus;
    private Map<String, Long> donationsByCategory;
    private long unreadNotifications;
}
