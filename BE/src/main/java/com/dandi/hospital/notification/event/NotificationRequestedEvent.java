package com.dandi.hospital.notification.event;

import com.dandi.hospital.notification.dto.NotificationCommand;

public record NotificationRequestedEvent(NotificationCommand command) {}
