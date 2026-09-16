package com.foodrescue.backend.repository;

import com.foodrescue.backend.model.Donation;
import com.foodrescue.backend.model.DonationStatus;
import com.foodrescue.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {

    /** Browse screen for recipient organisations: everything still available. */
    List<Donation> findByStatusOrderByCollectionDeadlineAsc(DonationStatus status);

    /** A donor's own donation history. */
    List<Donation> findByDonorOrderByCreatedAtDesc(User donor);

    List<Donation> findByStatus(DonationStatus status);

    /** Used by a scheduled job to flag/expire donations past their deadline. */
    List<Donation> findByStatusAndCollectionDeadlineBefore(DonationStatus status, Instant cutoff);

    /** Find donations by donor. */
    List<Donation> findByDonor(User donor);

    /** Check if any donation has a given status. */
    boolean existsByStatus(DonationStatus status);
}
