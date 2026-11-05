package com.dandi.hospital.visit.dto;

import com.dandi.hospital.visit.entity.Visit;

/** 매칭 처리에서 사용할 내부 생성 결과다. 공개 생성 API는 제공하지 않는다. */
public record VisitCreateResponse(Long visitId, Long requestId, Long volunteerId) {
    public static VisitCreateResponse from(Visit visit) {
        return new VisitCreateResponse(visit.getId(), visit.getRequestId(), visit.getVolunteerId());
    }
}
