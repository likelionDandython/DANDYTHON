package com.dandi.hospital.volunteer.dto;

import com.dandi.hospital.global.enums.Gender;
import jakarta.validation.constraints.*;

import java.util.List;

public record VolunteerProfileRequest(
        @NotNull @Min(value = 18, message = "만 18세 이상만 가입할 수 있습니다") @Max(100) Integer age,
        @NotNull Gender gender,
        @NotBlank @Size(max = 50) String school,
        @Size(max = 50) String major,
        @Min(1) @Max(6) Integer grade,
        @Size(max = 50) String hometown,
        @Size(max = 300) String intro,
        @Size(max = 500) String photoUrl,
        @Size(max = 10) List<@NotBlank @Size(max = 20) String> regions,
        @Size(max = 7) List<@NotBlank @Size(max = 3) String> availableDays,
        @Size(max = 5) List<@NotBlank @Size(max = 10) String> transports,
        @Size(max = 10) List<@NotBlank @Size(max = 20) String> abilities
) {}