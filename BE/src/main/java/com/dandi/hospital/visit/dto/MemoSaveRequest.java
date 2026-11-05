package com.dandi.hospital.visit.dto;

import com.dandi.hospital.visit.entity.Visit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MemoSaveRequest(
        @NotNull Boolean consent,
        @NotBlank @Size(max = Visit.MAX_MEMO_LENGTH) String memo
) {}
