package com.dandi.hospital.notification.entity;

import com.dandi.hospital.notification.dto.NotificationCommand;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_notifications", uniqueConstraints = @UniqueConstraint(
        name = "uk_notification_event_recipient", columnNames = {"event_key", "user_id"}),
        indexes = @Index(name = "idx_notification_user_read_id", columnList = "user_id,is_read,id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserNotification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "event_key", nullable = false, length = 160) private String eventKey;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 40) private NotificationType type;
    @Column(nullable = false) private Long requestId;
    private Long visitId;
    private Long applicationId;
    @Column(name = "is_read", nullable = false) private boolean read;
    private LocalDateTime readAt;
    @Column(nullable = false) private LocalDateTime occurredAt;

    public static UserNotification create(NotificationCommand command, LocalDateTime now) {
        UserNotification notification = new UserNotification();
        notification.eventKey = command.eventKey();
        notification.userId = command.recipientUserId();
        notification.type = command.type();
        notification.requestId = command.requestId();
        notification.visitId = command.visitId();
        notification.applicationId = command.applicationId();
        notification.occurredAt = now;
        return notification;
    }
}
