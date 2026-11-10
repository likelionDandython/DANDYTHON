package com.dandi.hospital.application.dto;

import com.dandi.hospital.global.enums.ApplicationStatus;
import com.dandi.hospital.global.enums.RequestStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalTime;

/** GET /api/applications/me 응답 항목 */
public record MyApplicationItem(
        Long applicationId,
        ApplicationStatus status,
        Long requestId,
        Long visitId,
        LocalDate date,
        @JsonFormat(pattern = "HH:mm") LocalTime meetTime,
        String hospitalName,
        RequestStatus requestStatus,
        Integer recognizedMinutes, // 체크아웃 후 계산된 시간
        Integer approvedMinutes    // 보호자 승인 후 인정된 시간
) {}
