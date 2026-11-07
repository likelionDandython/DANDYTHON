package com.dandi.hospital.visit.dto;

import com.dandi.hospital.global.enums.RequestStatus;
import com.dandi.hospital.visit.entity.Visit;

import java.time.LocalDateTime;

public record ApproveResponse(Long visitId, Integer approvedMinutes, LocalDateTime approvedAt,
                              RequestStatus requestStatus) {
    public static ApproveResponse from(Visit visit, RequestStatus requestStatus) {
        return new ApproveResponse(visit.getId(), visit.getApprovedMinutes(), visit.getApprovedAt(), requestStatus);
    }
}
