package com.dandi.hospital.notification.service;

import com.dandi.hospital.global.exception.*;
import com.dandi.hospital.notification.dto.*;
import com.dandi.hospital.notification.entity.NotificationSettings;
import com.dandi.hospital.notification.repository.*;
import com.dandi.hospital.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationInboxService {
    private final UserNotificationRepository notifications;
    private final NotificationSettingsRepository settings;
    private final UserRepository users;
    private final Clock clock;

    public NotificationList list(Long userId, int page, int size) {
        requireUser(userId);
        if (page < 0 || size < 1 || size > 100) throw new CustomException(ErrorCode.INVALID_INPUT);
        return new NotificationList(notifications.countByUserIdAndReadFalse(userId),
                notifications.findAllByUserIdOrderByIdDesc(userId, PageRequest.of(page, size)).stream()
                        .map(NotificationItem::from).toList());
    }

    @Transactional
    public void read(Long userId, Long id) {
        requireUser(userId);
        var notification = notifications.findById(id).orElseThrow(() -> new CustomException(ErrorCode.NOTIFICATION_NOT_FOUND));
        if (!notification.getUserId().equals(userId)) throw new CustomException(ErrorCode.FORBIDDEN);
        notifications.markRead(id, userId, now());
    }

    @Transactional
    public void readAll(Long userId) {
        requireUser(userId);
        notifications.markAllRead(userId, now());
    }

    public NotificationSettingsDto settings(Long userId) {
        requireUser(userId);
        return settings.findById(userId).map(NotificationSettings::toDto).orElseGet(NotificationSettingsDto::defaults);
    }

    @Transactional
    public NotificationSettingsDto updateSettings(Long userId, NotificationSettingsDto update) {
        requireUser(userId);
        if (update == null || update.departure() == null || update.arrival() == null || update.treatmentDone() == null
                || update.homecoming() == null || update.waiting() == null) throw new CustomException(ErrorCode.INVALID_INPUT);
        users.findByIdForUpdate(userId).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        var current = settings.findById(userId).orElseGet(() -> NotificationSettings.create(userId, update));
        current.update(update);
        return settings.save(current).toDto();
    }

    private void requireUser(Long id) {
        if (id == null) throw new CustomException(ErrorCode.UNAUTHORIZED);
        if (!users.existsById(id)) throw new CustomException(ErrorCode.USER_NOT_FOUND);
    }

    private LocalDateTime now() { return LocalDateTime.now(clock.withZone(ZoneId.of("Asia/Seoul"))); }
}
