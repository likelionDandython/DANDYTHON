package com.dandi.hospital.request.dto;

import com.dandi.hospital.global.enums.GenderPref;
import com.dandi.hospital.global.enums.TravelMode;
import com.dandi.hospital.request.entity.RequestTargetType;
import com.dandi.hospital.global.enums.MeetPlaceType;
import com.dandi.hospital.global.enums.Need;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record CreateRequestDto(
        RequestTargetType targetType,   // SELF(나) 또는 FAMILY(가족), 없으면 FAMILY
        Long seniorId,                  // FAMILY일 때만 필수
        TravelMode travelMode,          // 이동 방법 (선택)
        @NotNull @FutureOrPresent LocalDate date,
        @NotNull LocalTime meetTime,
        @NotNull MeetPlaceType meetPlaceType,
        @NotBlank @Size(max = 255) String meetAddress,
        @NotNull Long hospitalId,
        @NotBlank @Size(max = 50) String department,
        @NotEmpty List<Need> needs,
        String notes,
        @Min(1) @Max(2) int helpersNeeded,
        @NotNull GenderPref genderPref
) {}