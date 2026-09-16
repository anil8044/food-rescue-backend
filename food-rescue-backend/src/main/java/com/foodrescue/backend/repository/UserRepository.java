package com.foodrescue.backend.repository;

import com.foodrescue.backend.model.Role;
import com.foodrescue.backend.model.User;
import com.foodrescue.backend.model.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    /** Used by admins to review recipient organisations awaiting approval. */
    List<User> findByRoleAndVerificationStatus(Role role, VerificationStatus verificationStatus);

    /** Find users by verification status. */
    List<User> findByVerificationStatus(VerificationStatus verificationStatus);
}
