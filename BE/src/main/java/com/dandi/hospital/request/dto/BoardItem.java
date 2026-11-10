package com.dandi.hospital.request.dto;

import com.dandi.hospital.global.enums.MeetPlaceType;
import com.dandi.hospital.global.enums.Need;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record BoardItem(
        Long requestId,
        LocalDate date,
        @JsonFormat(pattern = "HH:mm") LocalTime meetTime,
        String hospitalName,
        String department,
        MeetPlaceType meetPlaceType,
        String region,
        List<Need> needs,
        int expectedHours,
        boolean twoRecommended,
        boolean urgent,
        boolean applied
) {}