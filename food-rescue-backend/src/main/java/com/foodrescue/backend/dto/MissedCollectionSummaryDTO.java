package com.foodrescue.backend.dto;

import com.foodrescue.backend.model.VerificationStatus;

import java.time.Instant;
import java.util.List;

/**
 * One row per recipient organisation that has missed at least one collection.
 */
public record MissedCollectionSummaryDTO(
        Long recipientId,
        String recipientName,
        String organisationName,
        String email,
        String phoneNumber,
        VerificationStatus verificationStatus,
        int missedCount,
        Instant lastMissedAt,
        List<MissedItem> missedItems
) {
    /** A single donation that was reserved but never collected. */
    public record MissedItem(Long donationId, String donationTitle, Instant collectionDeadline) {
    }
}