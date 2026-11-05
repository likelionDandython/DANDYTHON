package com.dandi.hospital.visit.entity;

import com.dandi.hospital.global.enums.VisitStep;

import java.time.LocalDateTime;

/** JSON으로 저장하는 체크리스트 항목. 완료 전에는 completedAt이 null이다. */
public record ChecklistItem(VisitStep step, String label, boolean done, LocalDateTime completedAt) {
    public static ChecklistItem pending(VisitStep step, String label) {
        return new ChecklistItem(step, label, false, null);
    }
}
