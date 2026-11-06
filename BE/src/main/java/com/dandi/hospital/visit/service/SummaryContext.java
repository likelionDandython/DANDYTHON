package com.dandi.hospital.visit.service;

import com.dandi.hospital.visit.dto.SummaryResponse;

import java.util.List;

public record SummaryContext(Long visitId, Long requestId, long memoRevision, String memo, String department, List<String> identifiers, SummaryResponse cached) {
    public SummaryContext {
        identifiers = List.copyOf(identifiers);
    }

    @Override
    public String toString() {
        return "SummaryContext[visitId=" + visitId + ", memoRevision=" + memoRevision + "]";
    }
}
