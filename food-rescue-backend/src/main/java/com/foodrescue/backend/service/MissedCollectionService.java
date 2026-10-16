package com.foodrescue.backend.service;

import com.foodrescue.backend.dto.MissedCollectionSummaryDTO;
import com.foodrescue.backend.dto.MissedCollectionSummaryDTO.MissedItem;
import com.foodrescue.backend.model.Donation;
import com.foodrescue.backend.model.DonationStatus;
import com.foodrescue.backend.model.Notification;
import com.foodrescue.backend.model.Reservation;
import com.foodrescue.backend.model.ReservationStatus;
import com.foodrescue.backend.model.Role;
import com.foodrescue.backend.model.User;
import com.foodrescue.backend.repository.DonationRepository;
import com.foodrescue.backend.repository.NotificationRepository;
import com.foodrescue.backend.repository.ReservationRepository;
import com.foodrescue.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Handles reservations that were never collected. When a reserved donation passes its
 * collection deadline the reservation becomes MISSED, the donation EXPIRED, and the
 * recipient, the donor and the administrators are told.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class MissedCollectionService {

    private final ReservationRepository reservationRepository;
    private final DonationRepository donationRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Called by the scheduler. Returns how many reservations were marked as missed.
     */
    public int markMissedCollections() {
        Instant now = Instant.now();

        List<Reservation> open = new ArrayList<>();
        open.addAll(reservationRepository.findByStatus(ReservationStatus.PENDING));
        open.addAll(reservationRepository.findByStatus(ReservationStatus.CONFIRMED));

        int marked = 0;
        List<User> admins = null;

        for (Reservation reservation : open) {
            Donation donation = reservation.getDonation();
            if (donation.getStatus() != DonationStatus.RESERVED) {
                continue;
            }
            if (!donation.getCollectionDeadline().isBefore(now)) {
                continue;
            }

            reservation.setStatus(ReservationStatus.MISSED);
            reservationRepository.save(reservation);
            donation.setStatus(DonationStatus.EXPIRED);
            donationRepository.save(donation);
            marked++;

            User recipient = reservation.getRecipientOrg();
            String title = shorten(donation.getTitle());
            long totalMissed = reservationRepository.findByRecipientOrg(recipient).stream()
                    .filter(r -> r.getStatus() == ReservationStatus.MISSED)
                    .count();

            sendNotification(recipient, donation.getId(),
                    "You did not collect \"" + title + "\" before its collection deadline. The reservation was marked as missed "
                            + "and the food could not be used. You have " + totalMissed + " missed collection"
                            + (totalMissed == 1 ? "" : "s") + ". Repeated misses may lead to your organisation being suspended.");

            sendNotification(donation.getDonor(), donation.getId(),
                    "\"" + title + "\" was reserved by " + displayName(recipient)
                            + " but not collected before the deadline. It has been marked as expired.");

            if (admins == null) {
                admins = userRepository.findByRole(Role.ADMIN);
            }
            for (User admin : admins) {
                sendNotification(admin, donation.getId(),
                        "Missed collection: " + displayName(recipient) + " did not collect \"" + title
                                + "\" (" + totalMissed + " missed in total).");
            }
        }
        return marked;
    }

    /**
     * Admin view: every recipient organisation with at least one missed collection, worst first.
     */
    @Transactional(readOnly = true)
    public List<MissedCollectionSummaryDTO> getSummary() {
        Map<Long, List<Reservation>> byRecipient = reservationRepository
                .findByStatus(ReservationStatus.MISSED).stream()
                .collect(Collectors.groupingBy(r -> r.getRecipientOrg().getId()));

        return byRecipient.values().stream()
                .map(this::toSummary)
                .sorted(Comparator.comparingInt(MissedCollectionSummaryDTO::missedCount).reversed()
                        .thenComparing(MissedCollectionSummaryDTO::lastMissedAt, Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    private MissedCollectionSummaryDTO toSummary(List<Reservation> missed) {
        User recipient = missed.get(0).getRecipientOrg();

        List<MissedItem> items = missed.stream()
                .map(r -> new MissedItem(r.getDonation().getId(), r.getDonation().getTitle(),
                        r.getDonation().getCollectionDeadline()))
                .sorted(Comparator.comparing(MissedItem::collectionDeadline).reversed())
                .collect(Collectors.toList());

        return new MissedCollectionSummaryDTO(
                recipient.getId(),
                recipient.getFullName(),
                recipient.getOrganisationName(),
                recipient.getEmail(),
                recipient.getPhoneNumber(),
                recipient.getVerificationStatus(),
                items.size(),
                items.get(0).collectionDeadline(),
                items
        );
    }

    private void sendNotification(User user, Long donationId, String message) {
        Notification n = new Notification();
        n.setRecipient(user);
        n.setType(Notification.NotificationType.MISSED_COLLECTION);
        n.setMessage(message.length() > 500 ? message.substring(0, 497) + "..." : message);
        n.setRelatedDonationId(donationId);
        n.setRead(false);
        notificationRepository.save(n);
    }

    private String displayName(User user) {
        String org = user.getOrganisationName();
        return (org != null && !org.isBlank()) ? org : user.getFullName();
    }

    private String shorten(String text) {
        return text.length() > 80 ? text.substring(0, 77) + "..." : text;
    }
}