package com.dandi.hospital.visit.dto;

import com.dandi.hospital.visit.entity.Visit;

public record MemoSaveResponse(Long visitId, boolean consent, boolean memoSaved) {
    public static MemoSaveResponse from(Visit visit) {
        return new MemoSaveResponse(visit.getId(), visit.isConsent(), visit.hasMemo());
    }
}
