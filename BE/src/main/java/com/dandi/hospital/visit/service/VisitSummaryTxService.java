package com.dandi.hospital.visit.service;

import com.dandi.hospital.global.enums.RequestStatus;
import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.service.RequestService;
import com.dandi.hospital.user.service.ConsentService;
import com.dandi.hospital.visit.dto.SummaryResponse;
import com.dandi.hospital.visit.entity.SummaryContent;
import com.dandi.hospital.visit.entity.SummaryStatus;
import com.dandi.hospital.visit.entity.Visit;
import com.dandi.hospital.visit.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Objects;
import org.springframework.context.ApplicationEventPublisher;
import com.dandi.hospital.notification.dto.NotificationCommand;
import com.dandi.hospital.notification.entity.NotificationType;
import com.dandi.hospital.notification.event.NotificationEvents;

@Service
@RequiredArgsConstructor
public class VisitSummaryTxService {
    private final VisitRepository visitRepository;
    private final RequestService requestService;
    private final VisitAccessPolicy accessPolicy;
    private final ConsentService consentService;
    private final SummaryPrivacyService privacyService;
    private final Clock visitClock;
    private final ApplicationEventPublisher events;

    @Transactional(readOnly = true)
    public SummaryContext loadContext(Long visitId, Long actorId) {
        accessPolicy.requireAuthenticated(actorId);
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new CustomException(ErrorCode.VISIT_NOT_FOUND));
        Request request = requestService.getById(visit.getRequestId());
        requireGenerationAllowed(visit, request, actorId);
        SummaryResponse cached = reusable(visit) ? SummaryResponse.from(visit) : null;
        return new SummaryContext(visit.getId(), request.getId(), visit.getMemoRevision(), visit.getMemo(),
                request.getDepartment(), cached == null ? privacyService.identifiers(request, visit) : java.util.List.of(), cached);
    }

    @Transactional
    public SummaryResponse saveResult(SummaryContext context, Long actorId, SummaryContent content) {
        accessPolicy.requireAuthenticated(actorId);
        Request request = requestService.getForUpdate(context.requestId());
        Visit visit = visitRepository.findByIdForUpdate(context.visitId())
                .orElseThrow(() -> new CustomException(ErrorCode.VISIT_NOT_FOUND));
        requireGenerationAllowed(visit, request, actorId);
        if (!Objects.equals(visit.getRequestId(), context.requestId())
                || visit.getMemoRevision() != context.memoRevision() || !Objects.equals(visit.getMemo(), context.memo())
                || !Objects.equals(request.getDepartment(), context.department()))
            throw new CustomException(ErrorCode.INVALID_STATUS);
        if (reusable(visit))
            return SummaryResponse.from(visit);
        visit.saveSummary(context.memoRevision(), content, LocalDateTime.now(visitClock).withNano(0));
        NotificationEvents.publish(events, new NotificationCommand("visit:" + visit.getId() + ":summary:" + visit.getMemoRevision(),
                NotificationType.SUMMARY_READY, request.getGuardianId(), request.getId(), visit.getId()));
        return SummaryResponse.from(visit);
    }

    private void requireGenerationAllowed(Visit visit, Request request, Long actorId) {
        accessPolicy.requireVolunteer(visit, actorId);
        if ((request.getStatus() != RequestStatus.IN_PROGRESS && request.getStatus() != RequestStatus.COMPLETED)
                || visit.getStartedAt() == null || visit.isApproved())
            throw new CustomException(ErrorCode.INVALID_STATUS);
        if (!visit.isConsent())
            throw new CustomException(ErrorCode.CONSENT_REQUIRED);
        consentService.requireHealthInfoConsent(request.getGuardianId());
        if (!visit.hasMemo())
            throw new CustomException(ErrorCode.INVALID_INPUT);
    }

    private boolean reusable(Visit visit) {
        return visit.getSummaryStatus() == SummaryStatus.DONE && visit.getSummary() != null
                && Objects.equals(visit.getSummaryMemoRevision(), visit.getMemoRevision());
    }
}
