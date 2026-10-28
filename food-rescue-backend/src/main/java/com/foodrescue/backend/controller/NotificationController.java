package com.foodrescue.backend.controller;

import com.foodrescue.backend.dto.NotificationDTO;
import com.foodrescue.backend.model.Notification;
import com.foodrescue.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for notification management endpoints.
 * Errors are handled centrally by GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PreAuthorize("@authz.selfOrAdmin(#userId)")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @PreAuthorize("@authz.selfOrAdmin(#userId)")
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @PreAuthorize("hasRole('ADMIN') or @authz.ownsNotification(#id)")
    @GetMapping("/{id}")
    public ResponseEntity<NotificationDTO> getNotificationById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(
            @RequestParam Long recipientId,
            @RequestParam Notification.NotificationType type,
            @RequestParam String message,
            @RequestParam(required = false) Long relatedDonationId) {
        NotificationDTO notification = notificationService.createNotification(
                recipientId, type, message, relatedDonationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    @PreAuthorize("hasRole('ADMIN') or @authz.ownsNotification(#id)")
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PreAuthorize("@authz.selfOrAdmin(#userId)")
    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN') or @authz.ownsNotification(#id)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}