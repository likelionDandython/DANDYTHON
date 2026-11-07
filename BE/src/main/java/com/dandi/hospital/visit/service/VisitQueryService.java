package com.dandi.hospital.visit.service;

import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.hospital.service.HospitalService;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.service.RequestService;
import com.dandi.hospital.visit.dto.VisitResponse;
import com.dandi.hospital.visit.dto.VisitTimeView;
import com.dandi.hospital.visit.dto.CertificateResponse;
import com.dandi.hospital.visit.entity.Visit;
import com.dandi.hospital.visit.repository.VisitRepository;
import com.dandi.hospital.volunteer.service.VolunteerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VisitQueryService {
    private final VisitRepository visitRepository;
    private final RequestService requestService;
    private final VisitAccessPolicy accessPolicy;
    private final VolunteerService volunteerService;
    private final HospitalService hospitalService;

    public CertificateResponse getCertificate(Long visitId, Long actorId) {
        accessPolicy.requireAuthenticated(actorId);
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new CustomException(ErrorCode.VISIT_NOT_FOUND));
        accessPolicy.requireVolunteer(visit, actorId);
        if (!visit.isApproved() || visit.getApprovedMinutes() == null
                || visit.getStartedAt() == null || visit.getEndedAt() == null)
            throw new CustomException(ErrorCode.INVALID_STATUS);

        Request request = requestService.getById(visit.getRequestId());
        var volunteer = volunteerService.getByUserId(visit.getVolunteerId());
        var hospital = hospitalService.getById(request.getHospitalId());
        return new CertificateResponse(volunteer.getUser().getName(), volunteer.getSchool(),
                request.getDate(), hospital.getName(), visit.getStartedAt().toLocalTime(),
                visit.getEndedAt().toLocalTime(), visit.getApprovedMinutes(), visit.getApprovedAt());
    }

    public Map<Long, VisitTimeView> getTimesByVisitIds(Collection<Long> visitIds) {
        if (visitIds == null || visitIds.stream().anyMatch(id -> id == null || id <= 0))
            throw new CustomException(ErrorCode.INVALID_INPUT);
        if (visitIds.isEmpty())
            return Map.of();
        return visitRepository.findTimesByVisitIds(Set.copyOf(visitIds)).stream()
                .collect(Collectors.toUnmodifiableMap(VisitTimeView::visitId, Function.identity()));
    }

    public VisitResponse getVisit(Long visitId, Long actorId) {
        accessPolicy.requireAuthenticated(actorId);
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new CustomException(ErrorCode.VISIT_NOT_FOUND));
        Request request = requestService.getById(visit.getRequestId());
        accessPolicy.requireViewer(visit, request, actorId);
        return VisitResponse.from(visit);
    }
}
