package com.dandi.hospital.notification.dto;

import com.dandi.hospital.notification.entity.UserNotification;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public record NotificationItem(Long notificationId, String type, String message, Long requestId, Long visitId,
                               boolean read, OffsetDateTime createdAt) {
    public static NotificationItem from(UserNotification notification) {
        return new NotificationItem(notification.getId(), notification.getType().name(), notification.getType().getMessage(),
                notification.getRequestId(), notification.getVisitId(), notification.isRead(),
                notification.getOccurredAt().atOffset(ZoneOffset.ofHours(9)));
    }
}
