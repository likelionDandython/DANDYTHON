package com.dandi.hospital.notification.service;

import com.dandi.hospital.global.exception.*;
import com.dandi.hospital.notification.client.*;
import com.dandi.hospital.notification.dto.*;
import com.dandi.hospital.notification.entity.*;
import com.dandi.hospital.notification.repository.*;
import com.dandi.hospital.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.*;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.*;
import java.util.*;

@Slf4j
@Service
public class NotificationService {
    private final UserNotificationRepository notifications;
    private final NotificationSettingsRepository settings;
    private final PushRegistrationRepository registrations;
    private final UserRepository users;
    private final PushClient push;
    private final Clock clock;
    private final TransactionTemplate transactions;

    public NotificationService(UserNotificationRepository notifications, NotificationSettingsRepository settings,
            PushRegistrationRepository registrations, UserRepository users, PushClient push,
            Clock clock, PlatformTransactionManager manager) {
        this.notifications = notifications;
        this.settings = settings;
        this.registrations = registrations;
        this.users = users;
        this.push = push;
        this.clock = clock;
        this.transactions = new TransactionTemplate(manager);
        this.transactions.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    public Long send(NotificationCommand command) {
        Created created = transactions.execute(status -> {
            users.findByIdForUpdate(command.recipientUserId()).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
            var existing = notifications.findByEventKeyAndUserId(command.eventKey(), command.recipientUserId());
            if (existing.isPresent()) return new Created(existing.get(), false);
            if (!allows(command.recipientUserId(), command.type())) return null;
            var notification = UserNotification.create(command, LocalDateTime.now(clock.withZone(ZoneId.of("Asia/Seoul"))));
            return new Created(notifications.saveAndFlush(notification), true);
        });
        if (created == null) return null;
        if (!created.fresh()) return created.notification().getId();
        var notification = created.notification();
        var devices = transactions.execute(status -> registrations.findAllByUserIdAndActiveTrueOrderByIdAsc(notification.getUserId())
                .stream().map(PushRegistration::getId).toList());
        for (Long device : Objects.requireNonNull(devices)) {
            try {
                transactions.executeWithoutResult(status -> registrations.findByIdForUpdate(device).ifPresent(registration -> {
                    if (!registration.isActive() || !registration.getUserId().equals(notification.getUserId())
                            || !allows(notification.getUserId(), notification.getType())) return;
                    push.send(message(notification, new PushTarget(registration.getRegistrationType(), registration.getRegistrationValue())));
                }));
            } catch (RuntimeException e) {
                log.warn("Push delivery failed: notificationId={}, registrationId={}", notification.getId(), device);
            }
        }
        return notification.getId();
    }

    private boolean allows(Long userId, NotificationType type) {
        return settings.findById(userId).map(NotificationSettings::toDto).orElseGet(NotificationSettingsDto::defaults).allows(type);
    }

    public static PushMessage message(UserNotification notification, PushTarget target) {
        Map<String, String> data = new HashMap<>();
        data.put("notificationId", notification.getId().toString());
        data.put("type", notification.getType().name());
        data.put("requestId", notification.getRequestId().toString());
        if (notification.getVisitId() != null) data.put("visitId", notification.getVisitId().toString());
        return new PushMessage(target, notification.getType().getTitle(), notification.getType().getMessage(), data);
    }

    private record Created(UserNotification notification, boolean fresh) {}
}
