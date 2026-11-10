package com.dandi.hospital.visit.dto;

import java.util.List;

public record VisitStatistics(long visitCount, long totalMinutes, List<VisitThanksMessage> thanksMessages) {
    public VisitStatistics {
        thanksMessages = List.copyOf(thanksMessages);
    }
}
