package com.dandi.hospital.notification.dto;

public record PushSendResult(Status status, String messageId) {
    public enum Status { ACCEPTED, DISABLED }

    public PushSendResult {
        if (status == null || (status == Status.ACCEPTED && (messageId == null || messageId.isBlank()))
                || (status == Status.DISABLED && messageId != null))
            throw new IllegalArgumentException("Push result status and message ID are inconsistent");
    }

    public static PushSendResult accepted(String messageId) {
        return new PushSendResult(Status.ACCEPTED, messageId);
    }

    public static PushSendResult disabled() {
        return new PushSendResult(Status.DISABLED, null);
    }
}
