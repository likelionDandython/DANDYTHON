package com.dandi.hospital.notification.dto;

import java.util.List;

public record NotificationList(long unreadCount, List<NotificationItem> notifications) {}
