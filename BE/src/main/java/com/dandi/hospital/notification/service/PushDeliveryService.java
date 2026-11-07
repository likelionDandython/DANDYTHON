package com.dandi.hospital.notification.service;

import com.dandi.hospital.notification.client.*;
import com.dandi.hospital.notification.dto.*;
import com.dandi.hospital.notification.entity.*;
import com.dandi.hospital.notification.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

import java.time.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushDeliveryService {
    private static final int MAX_ATTEMPTS = 3;
    private final PushDeliveryRepository deliveries;
    private final PushRegistrationRepository registrations;
    private final UserNotificationRepository notifications;
    private final NotificationSettingsRepository settings;
    private final PushClient push;
    private final Clock clock;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deliver(Long id) {
        PushDelivery delivery = deliveries.findByIdForUpdate(id).orElse(null);
        LocalDateTime now = LocalDateTime.now(clock.withZone(ZoneId.of("Asia/Seoul")));
        if (delivery == null || !delivery.isDue(now)) return;
        UserNotification notification = notifications.findById(delivery.getNotificationId()).orElse(null);
        // Keep the registration locked through send so account transfer and logout cannot interleave with it.
        PushRegistration registration = registrations.findByIdForUpdate(delivery.getRegistrationId()).orElse(null);
        if (notification == null || registration == null || !registration.isActive()
                || !registration.getUserId().equals(notification.getUserId())
                || registration.getGeneration() != delivery.getRegistrationGeneration()
                || !settings.findById(notification.getUserId()).map(NotificationSettings::toDto)
                    .orElseGet(NotificationSettingsDto::defaults).allows(notification.getType())) {
            delivery.finish(PushDelivery.Status.SKIPPED, now, null);
            return;
        }
        delivery.startAttempt();
        try {
            var result = push.send(NotificationService.message(notification,
                    new PushTarget(registration.getRegistrationType(), registration.getRegistrationValue())));
            if (result == null) throw new PushClientException(PushClientException.Reason.PROVIDER_ERROR);
            delivery.finish(result.status() == PushSendResult.Status.ACCEPTED ? PushDelivery.Status.ACCEPTED
                    : PushDelivery.Status.DISABLED, now, null);
        } catch (PushClientException e) {
            if (e.reason() == PushClientException.Reason.UNREGISTERED) {
                registration.deactivate();
                delivery.finish(PushDelivery.Status.INVALID, now, e.reason());
            } else if (retryable(e.reason()) && delivery.getAttempts() < MAX_ATTEMPTS) {
                // One minute minimum also respects the FCM quota-error backoff requirement.
                delivery.retry(now.plusSeconds(60L << (delivery.getAttempts() - 1)), e.reason());
            } else {
                delivery.finish(PushDelivery.Status.FAILED, now, e.reason());
            }
            log.warn("Push result: deliveryId={}, status={}, reason={}", id, delivery.getStatus(), e.reason());
        } catch (RuntimeException e) {
            delivery.finish(PushDelivery.Status.FAILED, now, PushClientException.Reason.PROVIDER_ERROR);
            log.warn("Push result: deliveryId={}, status=FAILED, reason=PROVIDER_ERROR", id);
        }
    }

    private boolean retryable(PushClientException.Reason reason) {
        return reason == PushClientException.Reason.UNAVAILABLE || reason == PushClientException.Reason.INTERNAL
                || reason == PushClientException.Reason.QUOTA_EXCEEDED;
    }
}
