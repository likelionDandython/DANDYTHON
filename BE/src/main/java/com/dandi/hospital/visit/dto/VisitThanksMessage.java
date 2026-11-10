package com.dandi.hospital.visit.dto;

import java.time.LocalDateTime;

public record VisitThanksMessage(String message, LocalDateTime createdAt) {
}
