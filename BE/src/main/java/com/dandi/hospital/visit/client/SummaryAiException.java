package com.dandi.hospital.visit.client;

public class SummaryAiException extends RuntimeException {
    public enum Reason { MISSING_KEY, INVALID_KEY, BUSY, TIMEOUT, HTTP_ERROR, INVALID_RESPONSE, INTERRUPTED, UNSAFE_INPUT, SHORT_MEMO }

    private final Reason reason;

    public SummaryAiException(Reason reason) {
        super(reason.name());
        this.reason = reason;
    }

    public Reason reason() {
        return reason;
    }
}
