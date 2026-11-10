package com.dandi.hospital.application.dto;

import jakarta.validation.constraints.Size;

public record ApplyRequestDto(
        @Size(max = 300) String message
) {}