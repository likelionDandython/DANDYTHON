package com.dandi.hospital.visit.dto;

public record VisitTimeView(Long visitId, Long requestId, Long volunteerId,
                            Integer recognizedMinutes, Integer approvedMinutes) {
}
