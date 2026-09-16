package com.foodrescue.backend.repository;

import com.foodrescue.backend.model.Donation;
import com.foodrescue.backend.model.Reservation;
import com.foodrescue.backend.model.ReservationStatus;
import com.foodrescue.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByDonation(Donation donation);

    /** A recipient organisation's reservation history. */
    List<Reservation> findByRecipientOrgOrderByReservedAtDesc(User recipientOrg);

    /** Find reservations by status. */
    List<Reservation> findByStatus(ReservationStatus status);

    /** Find all reservations for a recipient org. */
    List<Reservation> findByRecipientOrg(User recipientOrg);
}
