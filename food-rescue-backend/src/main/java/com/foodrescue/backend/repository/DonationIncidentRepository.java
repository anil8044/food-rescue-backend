package com.foodrescue.backend.repository;

import com.foodrescue.backend.model.Donation;
import com.foodrescue.backend.model.DonationIncident;
import com.foodrescue.backend.model.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface DonationIncidentRepository extends JpaRepository<DonationIncident, Long> {

    List<DonationIncident> findAllByOrderByReportedAtDesc();

    List<DonationIncident> findByStatusOrderByReportedAtDesc(IncidentStatus status);

    List<DonationIncident> findByDonationOrderByReportedAtDesc(Donation donation);

    /** Used for the admin's period incident report (e.g. for regulator conversations). */
    List<DonationIncident> findByReportedAtBetweenOrderByReportedAtDesc(Instant from, Instant to);
}
