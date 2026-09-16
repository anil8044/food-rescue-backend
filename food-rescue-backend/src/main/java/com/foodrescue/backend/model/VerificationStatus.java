package com.foodrescue.backend.model;

/**
 * Tracks whether a recipient (community/charity) organisation has been
 * approved to reserve donations. Donors and admins do not need verification.
 */
public enum VerificationStatus {
    PENDING,
    APPROVED,
    REJECTED
}
