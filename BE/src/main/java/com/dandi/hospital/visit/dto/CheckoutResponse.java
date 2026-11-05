package com.dandi.hospital.visit.dto;

import com.dandi.hospital.visit.entity.Visit;

import java.time.LocalDateTime;

public record CheckoutResponse(Long visitId, LocalDateTime startedAt,
                               LocalDateTime endedAt, Integer recognizedMinutes) {
    public static CheckoutResponse from(Visit visit) {
        return new CheckoutResponse(visit.getId(), visit.getStartedAt(),
                visit.getEndedAt(), visit.getRecognizedMinutes());
    }
}
