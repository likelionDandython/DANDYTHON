package com.dandi.hospital.notification.client;

public class PushClientException extends RuntimeException {
    public enum Reason {
        INVALID_MESSAGE, INVALID_ARGUMENT, UNREGISTERED, SENDER_ID_MISMATCH,
        QUOTA_EXCEEDED, UNAVAILABLE, INTERNAL, THIRD_PARTY_AUTH_ERROR, PROVIDER_ERROR
    }

    private final Reason reason;

    public PushClientException(Reason reason) {
        super("FCM push failed: " + reason.name());
        this.reason = reason;
    }

    public Reason reason() {
        return reason;
    }
}
