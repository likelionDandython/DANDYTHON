package com.dandi.hospital.visit.dto;

import java.time.LocalDateTime;

public record CheckinResponse(Long visitId, LocalDateTime startedAt) {}
