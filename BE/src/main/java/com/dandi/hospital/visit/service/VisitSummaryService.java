package com.dandi.hospital.visit.service;

import com.dandi.hospital.visit.client.SummaryAiClient;
import com.dandi.hospital.visit.client.SummaryAiException;
import com.dandi.hospital.visit.config.GeminiProperties;
import com.dandi.hospital.visit.dto.SummaryResponse;
import com.dandi.hospital.visit.entity.SummaryContent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VisitSummaryService {
    private final VisitSummaryTxService transactions;
    private final SummaryAiClient aiClient;
    private final MemoSanitizer sanitizer;
    private final GeminiProperties properties;

    @Transactional(propagation = Propagation.NEVER)
    public SummaryResponse generate(Long visitId, Long actorId) {
        SummaryContext context = transactions.loadContext(visitId, actorId);
        if (context.cached() != null)
            return context.cached();
        SummaryContent content = null;
        try {
            String memo = context.memo().strip();
            if (memo.codePointCount(0, memo.length()) < properties.getMinMemoLength())
                throw new SummaryAiException(SummaryAiException.Reason.SHORT_MEMO);
            content = aiClient.generate(sanitizer.departmentLabel(context.department()), sanitizer.sanitize(context));
        } catch (SummaryAiException e) {
            log.warn("Summary fallback: visitId={}, reason={}", visitId, e.reason());
        }
        return transactions.saveResult(context, actorId, content);
    }
}
