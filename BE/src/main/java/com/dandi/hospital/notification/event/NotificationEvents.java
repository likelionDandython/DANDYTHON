package com.dandi.hospital.notification.event;

import com.dandi.hospital.notification.dto.NotificationCommand;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;

@Slf4j
public final class NotificationEvents {
    private NotificationEvents() {}

    public static void publish(ApplicationEventPublisher publisher, NotificationCommand command) {
        try { publisher.publishEvent(new NotificationRequestedEvent(command)); }
        catch (RuntimeException e) {
            log.warn("Notification event could not be published: type={}, requestId={}", command.type(), command.requestId());
        }
    }
}
