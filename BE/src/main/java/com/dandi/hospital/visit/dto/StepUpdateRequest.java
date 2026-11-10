package com.dandi.hospital.visit.dto;

import com.dandi.hospital.global.enums.VisitStep;
import jakarta.validation.constraints.NotNull;

public record StepUpdateRequest(@NotNull VisitStep step, @NotNull Boolean done) {}
