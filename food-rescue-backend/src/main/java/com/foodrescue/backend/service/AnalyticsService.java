
package com.foodrescue.backend.service;

import com.foodrescue.backend.dto.DashboardStatsDTO;
import com.foodrescue.backend.model.*;
import com.foodrescue.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service layer for dashboard statistics and analytics.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final DonationRepository donationRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    /**
     * Get comprehensive dashboard statistics.
     */
    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // Donation statistics
        List<Donation> allDonations = donationRepository.findAll();
        stats.setTotalDonations(allDonations.size());

        List<Donation> activeDonations =
                donationRepository.findByStatus(DonationStatus.AVAILABLE);
        stats.setActiveDonations(activeDonations.size());

        // Donation status breakdown
        Map<DonationStatus, Long> donationsByStatus = allDonations.stream()
                .collect(Collectors.groupingBy(
                        Donation::getStatus,
                        Collectors.counting()
                ));
        stats.setDonationsByStatus(donationsByStatus);

        // Donation category breakdown
        Map<String, Long> donationsByCategory = allDonations.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getCategory().toString(),
                        Collectors.counting()
                ));
        stats.setDonationsByCategory(donationsByCategory);

        // Reservation statistics
        List<Reservation> allReservations = reservationRepository.findAll();
        stats.setTotalReservations(allReservations.size());

        List<Reservation> completedReservations =
                reservationRepository.findByStatus(ReservationStatus.COLLECTED);
        stats.setCompletedReservations(completedReservations.size());

        // User statistics
        List<User> allUsers = userRepository.findAll();
        stats.setTotalUsers(allUsers.size());

        List<User> approvedRecipients = userRepository
                .findByVerificationStatus(VerificationStatus.APPROVED);
        stats.setVerifiedRecipients(approvedRecipients.size());

        List<User> pendingVerifications = userRepository
                .findByVerificationStatus(VerificationStatus.PENDING);
        stats.setPendingVerifications(pendingVerifications.size());

        // Notification statistics
        stats.setUnreadNotifications(
                notificationRepository.countByIsReadFalse()
        );

        return stats;
    }

    /**
     * Get statistics specific to a user (recipient org).
     */
    public Map<String, Object> getUserStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found with ID: " + userId));

        Map<String, Object> stats = new HashMap<>();

        if (user.getRole().equals(Role.DONOR)) {

            // Donor statistics
            List<Donation> donations = donationRepository.findByDonor(user);
            stats.put("totalDonations", donations.size());

            Map<DonationStatus, Long> statusBreakdown = donations.stream()
                    .collect(Collectors.groupingBy(
                            Donation::getStatus,
                            Collectors.counting()
                    ));
            stats.put("donationsByStatus", statusBreakdown);

            long totalQuantity = donations.stream()
                    .mapToDouble(Donation::getQuantity)
                    .sum() > 0
                    ? (long) donations.stream()
                            .mapToDouble(Donation::getQuantity)
                            .sum()
                    : 0;

            stats.put("totalQuantityDonated", totalQuantity);

        } else if (user.getRole().equals(Role.RECIPIENT_ORG)) {

            // Recipient org statistics
            List<Reservation> reservations =
                    reservationRepository.findByRecipientOrg(user);

            stats.put("totalReservations", reservations.size());

            Map<ReservationStatus, Long> statusBreakdown = reservations.stream()
                    .collect(Collectors.groupingBy(
                            Reservation::getStatus,
                            Collectors.counting()
                    ));
            stats.put("reservationsByStatus", statusBreakdown);

            long completedCount = reservations.stream()
                    .filter(r ->
                            r.getStatus().equals(ReservationStatus.COLLECTED))
                    .count();

            stats.put("completedReservations", completedCount);

            long totalQuantity = reservations.stream()
                    .filter(r ->
                            r.getStatus().equals(ReservationStatus.COLLECTED))
                    .mapToDouble(r -> r.getDonation().getQuantity())
                    .sum() > 0
                    ? (long) reservations.stream()
                            .filter(r ->
                                    r.getStatus().equals(ReservationStatus.COLLECTED))
                            .mapToDouble(r -> r.getDonation().getQuantity())
                            .sum()
                    : 0;

            stats.put("totalQuantityReceived", totalQuantity);
        }

        // Common stats for both roles
        long unreadNotifications = notificationRepository
                .countByRecipientAndIsReadFalse(user);

        stats.put("unreadNotifications", unreadNotifications);

        return stats;
    }
}
