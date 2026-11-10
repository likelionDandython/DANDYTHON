package com.dandi.hospital.visit.entity;

import com.dandi.hospital.global.enums.VisitStep;

import java.time.LocalDateTime;

public record ChecklistItem(VisitStep step, String label, boolean done, LocalDateTime completedAt) {
    public static ChecklistItem pending(VisitStep step, String label) {
        return new ChecklistItem(step, label, false, null);
    }

    public ChecklistItem withCompletion(boolean completed, LocalDateTime time) {
        if (done == completed)
            return this;
        return new ChecklistItem(step, label, completed, completed ? time : null);
    }
}
