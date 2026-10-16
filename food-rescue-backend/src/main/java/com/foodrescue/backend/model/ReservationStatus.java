package com.foodrescue.backend.model;

public enum ReservationStatus {
    PENDING,
    CONFIRMED,
    COLLECTED,
    CANCELLED,
    /** The recipient never collected the food before the collection deadline (a no-show). */
    MISSED
}