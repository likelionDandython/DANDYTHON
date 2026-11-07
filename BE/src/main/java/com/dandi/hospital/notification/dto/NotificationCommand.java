package com.dandi.hospital.notification.dto;

import com.dandi.hospital.notification.entity.NotificationType;

public record NotificationCommand(String eventKey, NotificationType type, Long recipientUserId,
                                  Long requestId, Long visitId) {
    public NotificationCommand {
        if (eventKey == null || eventKey.isBlank() || eventKey.length() > 160 || type == null
                || recipientUserId == null || recipientUserId <= 0 || requestId == null || requestId <= 0
                || (visitId != null && visitId <= 0))
            throw new IllegalArgumentException("Notification event and recipient are required");
    }
}
