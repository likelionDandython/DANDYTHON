package com.dandi.hospital.request.dto;

import com.dandi.hospital.global.enums.GenderPref;
import com.dandi.hospital.global.enums.MeetPlaceType;
import com.dandi.hospital.global.enums.Need;
import com.dandi.hospital.global.enums.RequestStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** GET /api/requests/{requestId} 응답 */
public record RequestDetail(
        Long requestId,
        RequestStatus status,
        Long requesterId,
        int expectedHours,
        SeniorInfo senior,
        LocalDate date,
        @JsonFormat(pattern = "HH:mm") LocalTime meetTime,
        MeetPlaceType meetPlaceType,
        String meetAddress,          // 요청자·확정 봉사자에게만 공개
        HospitalInfo hospital,
        String department,
        List<Need> needs,
        String notes,
        int helpersNeeded,
        GenderPref genderPref,
        ContactInfo guardian,        // 요청자·확정 봉사자에게만 공개
        List<VolunteerInfo> volunteers, // 요청자·확정 봉사자에게만 공개
        Long visitId
) {
    public record SeniorInfo(String name, int age, String region, String phone) {}

    public record HospitalInfo(Long hospitalId, String name) {}

    public record ContactInfo(String name, String phone) {}

    public record VolunteerInfo(Long userId, String name, String phone) {}
}
