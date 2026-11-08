package com.dandi.hospital.notification.event;

import com.dandi.hospital.notification.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.*;

@Slf4j
@Component
public class NotificationEventListener {
    private final NotificationService notifications;
    private final TaskExecutor executor;

    public NotificationEventListener(NotificationService notifications,
            @Qualifier("notificationExecutor") TaskExecutor executor) {
        this.notifications = notifications;
        this.executor = executor;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void afterCommit(NotificationRequestedEvent event) {
        try {
            executor.execute(() -> {
                try { notifications.send(event.command()); }
                catch (RuntimeException e) {
                    log.warn("Notification event processing failed: type={}, requestId={}",
                            event.command().type(), event.command().requestId());
                }
            });
        } catch (RuntimeException e) {
            log.warn("Notification queue rejected event: type={}, requestId={}",
                    event.command().type(), event.command().requestId());
        }
    }
}
