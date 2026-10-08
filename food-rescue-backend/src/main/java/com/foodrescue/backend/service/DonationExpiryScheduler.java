package com.foodrescue.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Regularly marks AVAILABLE donations as EXPIRED once their collect-by time has passed.
 * Reserved and collected donations are left alone.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DonationExpiryScheduler {

    private final DonationService donationService;

    @Scheduled(initialDelay = 10_000, fixedDelay = 60_000)
    public void expireOverdueDonations() {
        int expired = donationService.expireOverdueDonations();
        if (expired > 0) {
            log.info("Marked {} overdue donation(s) as EXPIRED", expired);
        }
    }
}