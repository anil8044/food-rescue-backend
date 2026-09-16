package com.foodrescue.backend.model;

/**
 * Donation lifecycle, as described in the Assessment 1 proposal scope:
 * AVAILABLE -> RESERVED -> COLLECTED, with EXPIRED / CANCELLED as
 * terminal states if the donation is not collected in time or is withdrawn.
 */
public enum DonationStatus {
    AVAILABLE,
    RESERVED,
    COLLECTED,
    EXPIRED,
    CANCELLED
}
