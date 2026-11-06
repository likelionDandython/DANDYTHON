package com.dandi.hospital.visit.service;

import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.service.RequestService;
import com.dandi.hospital.visit.dto.VisitResponse;
import com.dandi.hospital.visit.entity.Visit;
import com.dandi.hospital.visit.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VisitQueryService {
    private final VisitRepository visitRepository;
    private final RequestService requestService;
    private final VisitAccessPolicy accessPolicy;

    public VisitResponse getVisit(Long visitId, Long actorId) {
        accessPolicy.requireAuthenticated(actorId);
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new CustomException(ErrorCode.VISIT_NOT_FOUND));
        Request request = requestService.getById(visit.getRequestId());
        accessPolicy.requireViewer(visit, request, actorId);
        return VisitResponse.from(visit);
    }
}
