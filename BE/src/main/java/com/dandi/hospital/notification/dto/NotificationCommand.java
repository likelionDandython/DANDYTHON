package com.dandi.hospital.notification.dto;

import com.dandi.hospital.notification.entity.NotificationType;

public record NotificationCommand(String eventKey, NotificationType type, Long recipientUserId, Long requestId, Long visitId, Long applicationId) {
    public NotificationCommand(String eventKey, NotificationType type, Long recipientUserId, Long requestId, Long visitId) {
        this(eventKey, type, recipientUserId, requestId, visitId, null);
    }
    public NotificationCommand {
        if (eventKey == null || eventKey.isBlank() || eventKey.length() > 160 || type == null
                || recipientUserId == null || recipientUserId <= 0 || requestId == null || requestId <= 0
                || (visitId != null && visitId <= 0) || (applicationId != null && applicationId <= 0))
            throw new IllegalArgumentException("Notification event and recipient are required");
    }
}
