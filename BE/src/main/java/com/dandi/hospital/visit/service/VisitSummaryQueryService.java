package com.dandi.hospital.visit.service;

import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.entity.RequestTargetType;
import com.dandi.hospital.request.service.RequestService;
import com.dandi.hospital.user.service.ConsentService;
import com.dandi.hospital.visit.dto.SummaryResponse;
import com.dandi.hospital.visit.entity.SummaryStatus;
import com.dandi.hospital.visit.entity.Visit;
import com.dandi.hospital.visit.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VisitSummaryQueryService {
    private final VisitRepository visitRepository;
    private final RequestService requestService;
    private final VisitAccessPolicy accessPolicy;
    private final ConsentService consentService;

    public SummaryResponse getSummary(Long visitId, Long actorId) {
        accessPolicy.requireAuthenticated(actorId);
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new CustomException(ErrorCode.VISIT_NOT_FOUND));
        Request request = requestService.getById(visit.getRequestId());
        accessPolicy.requireViewer(visit, request, actorId);
        if (actorId.equals(request.getGuardianId())) {
            consentService.requireSummaryReceiveConsent(actorId);
            if (request.getTargetType() != RequestTargetType.SELF)
                consentService.requireSummaryShareConsent(actorId);
        }
        if (!hasCurrentResult(visit))
            throw new CustomException(ErrorCode.SUMMARY_NOT_FOUND);
        if (!visit.isConsent())
            throw new CustomException(ErrorCode.CONSENT_REQUIRED);
        consentService.requireHealthInfoConsent(request.getGuardianId());
        return SummaryResponse.from(visit);
    }

    private boolean hasCurrentResult(Visit visit) {
        if (!visit.hasMemo() || visit.getSummarizedAt() == null || !Objects.equals(visit.getSummaryMemoRevision(), visit.getMemoRevision()))
            return false;
        return (visit.getSummaryStatus() == SummaryStatus.DONE && visit.getSummary() != null) || (visit.getSummaryStatus() == SummaryStatus.FALLBACK && visit.getSummary() == null);
    }
}
