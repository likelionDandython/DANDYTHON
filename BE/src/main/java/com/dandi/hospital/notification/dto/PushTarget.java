package com.dandi.hospital.notification.dto;

public record PushTarget(Type type, String value) {
    public enum Type { TOKEN, FID }

    public PushTarget {
        if (type == null || value == null || value.isBlank())
            throw new IllegalArgumentException("Push target type and value are required");
    }

    @Override
    public String toString() {
        return "PushTarget[type=" + type + ", value=[REDACTED]]";
    }
}
