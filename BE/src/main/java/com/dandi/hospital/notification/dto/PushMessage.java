package com.dandi.hospital.notification.dto;

import java.util.Map;

public record PushMessage(PushTarget target, String title, String body, Map<String, String> data) {
    public PushMessage {
        if (target == null || title == null || title.isBlank() || body == null || body.isBlank())
            throw new IllegalArgumentException("Push target, title and body are required");
        if (data != null && data.entrySet().stream().anyMatch(entry -> entry.getKey() == null
                || entry.getKey().isBlank() || entry.getValue() == null))
            throw new IllegalArgumentException("Push data requires non-empty keys and non-null values");
        data = data == null ? Map.of() : Map.copyOf(data);
    }

    @Override
    public String toString() {
        return "PushMessage[targetType=" + target.type() + "]";
    }
}
