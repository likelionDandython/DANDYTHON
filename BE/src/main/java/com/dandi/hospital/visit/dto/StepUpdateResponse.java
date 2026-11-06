package com.dandi.hospital.visit.dto;

import com.dandi.hospital.global.enums.VisitStep;

public record StepUpdateResponse(Long visitId, VisitStep step) {}
