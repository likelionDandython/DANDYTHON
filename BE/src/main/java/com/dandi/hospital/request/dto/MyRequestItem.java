package com.dandi.hospital.request.dto;

import com.dandi.hospital.global.enums.RequestStatus;

import java.time.LocalDate;

/** GET /api/requests/me 응답 항목 */
public record MyRequestItem(
        Long requestId,
        String seniorName,
        LocalDate date,
        String hospitalName,
        RequestStatus status,
        long applicantCount // 대기 중 + 수락된 신청 수
) {}
