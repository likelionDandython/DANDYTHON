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
    private final PushDeliveryRepository deliveries;
    private final PushDeliveryService deliveryService;
    private final NotificationEligibility eligibility;
    private final Clock clock;
    private final TransactionTemplate transactions;

    public NotificationService(UserNotificationRepository notifications, NotificationSettingsRepository settings,
            PushRegistrationRepository registrations, UserRepository users, PushDeliveryRepository deliveries,
            PushDeliveryService deliveryService,
            NotificationEligibility eligibility, Clock clock, PlatformTransactionManager manager) {
        this.notifications = notifications;
        this.settings = settings;
        this.registrations = registrations;
        this.users = users;
        this.deliveries = deliveries;
        this.deliveryService = deliveryService;
        this.eligibility = eligibility;
        this.clock = clock;
        this.transactions = new TransactionTemplate(manager);
        this.transactions.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    public Long send(NotificationCommand command) {
        Created created = transactions.execute(status -> {
            if (!eligibility.permits(command)) return null;
            users.findByIdForUpdate(command.recipientUserId()).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
            var existing = notifications.findByEventKeyAndUserId(command.eventKey(), command.recipientUserId());
            if (existing.isPresent()) return new Created(existing.get(), List.of());
            if (!allows(command.recipientUserId(), command.type())) return null;
            var notification = UserNotification.create(command, LocalDateTime.now(clock.withZone(ZoneId.of("Asia/Seoul"))));
            notifications.saveAndFlush(notification);
            var jobs = registrations.findAllByUserIdAndActiveTrueOrderByIdAsc(notification.getUserId()).stream()
                    .map(registration -> PushDelivery.create(notification.getId(), registration, notification.getOccurredAt())).toList();
            return new Created(notification, deliveries.saveAllAndFlush(jobs).stream().map(PushDelivery::getId).toList());
        });
        if (created == null) return null;
        var notification = created.notification();
        for (Long delivery : created.deliveryIds()) {
            try {
                deliveryService.deliver(delivery);
            } catch (RuntimeException e) {
                log.warn("Push delivery deferred: notificationId={}, deliveryId={}", notification.getId(), delivery);
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

    private record Created(UserNotification notification, List<Long> deliveryIds) {}
}
