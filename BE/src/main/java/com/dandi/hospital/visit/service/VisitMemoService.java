package com.dandi.hospital.visit.service;

import com.dandi.hospital.global.enums.RequestStatus;
import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.service.RequestService;
import com.dandi.hospital.user.service.ConsentService;
import com.dandi.hospital.visit.dto.MemoSaveRequest;
import com.dandi.hospital.visit.dto.MemoSaveResponse;
import com.dandi.hospital.visit.entity.Visit;
import com.dandi.hospital.visit.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VisitMemoService {
    private final VisitRepository visitRepository;
    private final RequestService requestService;
    private final ConsentService consentService;
    private final VisitAccessPolicy accessPolicy;
    private final Clock visitClock;

    @Transactional
    public MemoSaveResponse save(Long visitId, Long actorId, MemoSaveRequest input) {
        accessPolicy.requireAuthenticated(actorId);
        Long requestId = visitRepository.findRequestIdByVisitId(visitId)
                .orElseThrow(() -> new CustomException(ErrorCode.VISIT_NOT_FOUND));
        Request request = requestService.getForUpdate(requestId);
        Visit visit = visitRepository.findByIdForUpdate(visitId)
                .orElseThrow(() -> new CustomException(ErrorCode.VISIT_NOT_FOUND));
        accessPolicy.requireVolunteer(visit, actorId);

        if ((request.getStatus() != RequestStatus.IN_PROGRESS && request.getStatus() != RequestStatus.COMPLETED)
                || visit.getStartedAt() == null || visit.isApproved())
            throw new CustomException(ErrorCode.INVALID_STATUS);
        if (input == null || input.consent() == null)
            throw new CustomException(ErrorCode.INVALID_INPUT);

        consentService.requireHealthInfoConsent(request.getGuardianId());
        visit.saveMemo(input.consent(), input.memo(), LocalDateTime.now(visitClock).withNano(0));
        return MemoSaveResponse.from(visit);
    }
}
