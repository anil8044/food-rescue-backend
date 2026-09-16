package com.foodrescue.backend.dto;

import com.foodrescue.backend.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Data transfer object for Notification response.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {

    private Long id;
    private Long recipientUserId;
    private String recipientUserName;
    private Notification.NotificationType type;
    private String message;
    private Long relatedDonationId;
    private boolean isRead;
    private Instant createdAt;
}
