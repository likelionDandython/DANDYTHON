package com.dandi.hospital.application.dto;

import com.dandi.hospital.global.enums.ApplicationStatus;
import com.dandi.hospital.global.enums.Gender;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/** GET /api/requests/{requestId}/applications 응답 항목 */
public record ApplicationItem(
        Long applicationId,
        ApplicationStatus status,
        String message,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime createdAt,
        VolunteerSummary volunteer
) {
    public record VolunteerSummary(
            Long userId,
            String name,
            int age,
            Gender gender,
            String school,
            String major,
            int grade,
            String hometown,
            String photoUrl,
            boolean verified,
            long visitCount // 지금까지 수락된 동행 수
    ) {}
}
