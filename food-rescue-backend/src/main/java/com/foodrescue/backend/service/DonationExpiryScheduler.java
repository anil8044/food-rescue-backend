package com.foodrescue.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Regularly tidies up donations that were not collected in time:
 * AVAILABLE donations past their collect-by time become EXPIRED, and reservations that were
 * never collected become MISSED (the recipient, donor and admins are notified).
 * Collected donations are left alone.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DonationExpiryScheduler {

    private final DonationService donationService;
    private final MissedCollectionService missedCollectionService;

    @Scheduled(initialDelay = 10_000, fixedDelay = 60_000)
    public void expireOverdueDonations() {
        int expired = donationService.expireOverdueDonations();
        if (expired > 0) {
            log.info("Marked {} overdue donation(s) as EXPIRED", expired);
        }

        int missed = missedCollectionService.markMissedCollections();
        if (missed > 0) {
            log.info("Marked {} reservation(s) as MISSED", missed);
        }
    }
}