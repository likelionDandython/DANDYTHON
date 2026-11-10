package com.dandi.hospital.visit.client;

import com.dandi.hospital.visit.entity.SummaryContent;

public interface SummaryAiClient {
    SummaryContent generate(String department, String sanitizedMemo);
}
