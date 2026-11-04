package com.dandi.hospital.request.dto;

import com.dandi.hospital.global.enums.GenderPref;
import com.dandi.hospital.global.enums.MeetPlaceType;
import com.dandi.hospital.global.enums.Need;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record CreateRequestDto(
        @NotNull Long seniorId,
        @NotNull LocalDate date,
        @NotNull LocalTime meetTime,
        @NotNull MeetPlaceType meetPlaceType,
        @NotBlank String meetAddress,
        @NotNull Long hospitalId,
        @NotBlank String department,
        @NotEmpty List<Need> needs,
        String notes,
        @Min(1) int helpersNeeded,
        @NotNull GenderPref genderPref
) {}