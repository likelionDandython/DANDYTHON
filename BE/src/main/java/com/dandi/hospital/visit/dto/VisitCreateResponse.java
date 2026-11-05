package com.dandi.hospital.visit.dto;

import com.dandi.hospital.visit.entity.Visit;

public record VisitCreateResponse(Long visitId, Long requestId, Long volunteerId) {
    public static VisitCreateResponse from(Visit visit) {
        return new VisitCreateResponse(visit.getId(), visit.getRequestId(), visit.getVolunteerId());
    }
}
