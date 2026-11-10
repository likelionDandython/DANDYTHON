package com.dandi.hospital.notification.repository;

import com.dandi.hospital.notification.entity.NotificationSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, Long> {}
