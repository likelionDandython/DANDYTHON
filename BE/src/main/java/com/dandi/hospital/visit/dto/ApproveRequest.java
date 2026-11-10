package com.dandi.hospital.visit.dto;

import com.dandi.hospital.visit.entity.Visit;
import jakarta.validation.constraints.Size;

public record ApproveRequest(@Size(max = Visit.MAX_THANKS_LENGTH) String thanks) {
}
