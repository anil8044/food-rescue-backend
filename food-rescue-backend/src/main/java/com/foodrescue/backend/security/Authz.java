package com.foodrescue.backend.security;

import com.foodrescue.backend.model.Donation;
import com.foodrescue.backend.model.ReservationStatus;
import com.foodrescue.backend.model.Role;
import com.foodrescue.backend.model.User;
import com.foodrescue.backend.repository.DonationRepository;
import com.foodrescue.backend.repository.NotificationRepository;
import com.foodrescue.backend.repository.ReservationRepository;
import com.foodrescue.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ownership checks used in @PreAuthorize expressions, for example
 * {@code @PreAuthorize("@authz.selfOrAdmin(#userId)")}.
 */
@Component("authz")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class Authz {

    private final DonationRepository donationRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public AuthUser me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthUser user) {
            return user;
        }
        return null;
    }

    public boolean isAdmin() {
        AuthUser user = me();
        return user != null && user.role() == Role.ADMIN;
    }

    public boolean isSelf(Long userId) {
        AuthUser user = me();
        return user != null && userId != null && user.id().equals(userId);
    }

    public boolean selfOrAdmin(Long userId) {
        return isAdmin() || isSelf(userId);
    }

    /** True if the signed-in user is the donor who posted this donation. */
    public boolean ownsDonation(Long donationId) {
        return donationRepository.findById(donationId)
                .map(donation -> isSelf(donation.getDonor().getId()))
                .orElse(false);
    }

    /** True if the signed-in user is the recipient organisation on this reservation. */
    public boolean ownsReservation(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .map(reservation -> isSelf(reservation.getRecipientOrg().getId()))
                .orElse(false);
    }

    /** True if the signed-in user is the owner of this notification. */
    public boolean ownsNotification(Long notificationId) {
        return notificationRepository.findById(notificationId)
                .map(notification -> isSelf(notification.getRecipient().getId()))
                .orElse(false);
    }

    /**
     * True if the signed-in recipient organisation has a reservation (not cancelled)
     * on this donation. Only those organisations can flag a problem with it.
     */
    public boolean hasReservedDonation(Long donationId) {
        AuthUser me = me();
        if (me == null) {
            return false;
        }
        Donation donation = donationRepository.findById(donationId).orElse(null);
        User user = userRepository.findById(me.id()).orElse(null);
        if (donation == null || user == null) {
            return false;
        }
        return reservationRepository.existsByDonationAndRecipientOrgAndStatusNot(
                donation, user, ReservationStatus.CANCELLED);
    }
}
