package com.foodrescue.backend.repository;

import com.foodrescue.backend.model.Donation;
import com.foodrescue.backend.model.Reservation;
import com.foodrescue.backend.model.ReservationStatus;
import com.foodrescue.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * Only safe while a donation has at most one reservation row. A donation can now have
     * several over time (a cancelled one plus a new one), so use
     * findFirstByDonationAndStatusNot instead.
     */
    Optional<Reservation> findByDonation(Donation donation);

    /**
     * Finds a reservation on this donation whose status is NOT the one given.
     * Called with CANCELLED to ask "does this donation have an active reservation?"
     */
    Optional<Reservation> findFirstByDonationAndStatusNot(Donation donation, ReservationStatus status);

    /**
     * True if this organisation holds a reservation on the donation whose status is not the
     * one given. Called with CANCELLED to ask "did this organisation reserve or collect it?"
     */
    boolean existsByDonationAndRecipientOrgAndStatusNot(Donation donation, User recipientOrg, ReservationStatus status);

    /** A recipient organisation's reservation history. */
    List<Reservation> findByRecipientOrgOrderByReservedAtDesc(User recipientOrg);

    /** Find reservations by status. */
    List<Reservation> findByStatus(ReservationStatus status);

    /** Find all reservations for a recipient org. */
    List<Reservation> findByRecipientOrg(User recipientOrg);
}