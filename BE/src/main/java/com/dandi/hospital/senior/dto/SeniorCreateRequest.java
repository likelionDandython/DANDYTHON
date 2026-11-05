package com.dandi.hospital.senior.dto;

import jakarta.validation.constraints.*;

public record SeniorCreateRequest(
        @NotBlank @Size(max = 30) String name,
        @NotNull @Min(1) @Max(120) Integer age,
        @Pattern(regexp = "^$|^01\\d-?\\d{3,4}-?\\d{4}$", message = "전화번호 형식이 올바르지 않습니다") String phone,
        @NotBlank @Size(max = 30) String region
) {}
