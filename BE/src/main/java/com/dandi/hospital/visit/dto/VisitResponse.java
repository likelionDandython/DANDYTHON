package com.dandi.hospital.visit.dto;

import com.dandi.hospital.global.enums.VisitStep;
import com.dandi.hospital.visit.entity.ChecklistItem;
import com.dandi.hospital.visit.entity.Visit;

import java.time.LocalDateTime;
import java.util.List;

public record VisitResponse(Long visitId, Long requestId, VisitStep step, List<ChecklistItem> checklist,
        LocalDateTime startedAt, LocalDateTime endedAt, boolean consent, boolean hasMemo, boolean hasSummary, boolean approved) {
    public static VisitResponse from(Visit visit) {
        return new VisitResponse(visit.getId(), visit.getRequestId(), visit.getStep(),
                visit.getChecklist(), visit.getStartedAt(), visit.getEndedAt(), visit.isConsent(),
                visit.hasMemo(), visit.hasSummary(), visit.isApproved());
    }
}
