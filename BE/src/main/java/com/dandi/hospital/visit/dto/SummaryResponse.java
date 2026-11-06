package com.dandi.hospital.visit.dto;

import com.dandi.hospital.visit.entity.SummaryContent;
import com.dandi.hospital.visit.entity.SummaryStatus;
import com.dandi.hospital.visit.entity.Visit;

public record SummaryResponse(Long visitId, SummaryStatus status, SummaryContent summary, String rawMemo) {
    public static SummaryResponse from(Visit visit) {
        return new SummaryResponse(visit.getId(), visit.getSummaryStatus(), visit.getSummary(), visit.getMemo());
    }
}
