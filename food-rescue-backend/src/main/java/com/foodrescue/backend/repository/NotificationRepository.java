package com.foodrescue.backend.repository;

import com.foodrescue.backend.model.Notification;
import com.foodrescue.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);

    /** Count unread notifications globally. */
    long countByIsReadFalse();

    /** Count unread notifications for a specific user. */
    long countByRecipientAndIsReadFalse(User recipient);
}
