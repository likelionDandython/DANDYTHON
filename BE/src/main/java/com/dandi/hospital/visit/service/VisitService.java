package com.dandi.hospital.visit.service;

import com.dandi.hospital.global.enums.RequestStatus;
import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.service.RequestService;
import com.dandi.hospital.visit.dto.VisitCreateResponse;
import com.dandi.hospital.visit.dto.CheckinResponse;
import com.dandi.hospital.visit.dto.StepUpdateRequest;
import com.dandi.hospital.visit.dto.StepUpdateResponse;
import com.dandi.hospital.visit.dto.CheckoutResponse;
import com.dandi.hospital.visit.dto.ApproveResponse;
import com.dandi.hospital.visit.entity.Visit;
import com.dandi.hospital.visit.repository.VisitRepository;
import com.dandi.hospital.volunteer.entity.Volunteer;
import com.dandi.hospital.volunteer.service.VolunteerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VisitService {
    private final VisitRepository visitRepository;
    private final ChecklistFactory checklistFactory;
    private final RequestService requestService;
    private final VolunteerService volunteerService;
    private final VisitAccessPolicy accessPolicy;
    private final Clock visitClock;
    private final RecognizedMinutesCalculator minutesCalculator;

    @Transactional
    public VisitCreateResponse create(Request request, Volunteer volunteer) {
        if (request == null || request.getId() == null || volunteer == null
                || volunteer.getId() == null || volunteer.getUser() == null
                || volunteer.getUser().getId() == null)
            throw new CustomException(ErrorCode.INVALID_INPUT);

        Request lockedRequest = requestService.getForVisitCreation(request.getId());
        Long volunteerId = volunteerService.getByUserId(volunteer.getUser().getId()).getUser().getId();

        if (lockedRequest.getGuardianId().equals(volunteerId))
            throw new CustomException(ErrorCode.FORBIDDEN);

        var existing = visitRepository.findByRequestIdAndVolunteerId(lockedRequest.getId(), volunteerId);
        if (existing.isPresent()) {
            if (lockedRequest.getStatus() == RequestStatus.CANCELED || lockedRequest.getStatus() == RequestStatus.RECRUITING)
                throw new CustomException(ErrorCode.INVALID_STATUS);
            return VisitCreateResponse.from(existing.get());
        }

        if (lockedRequest.getStatus() != RequestStatus.CONFIRMED)
            throw new CustomException(ErrorCode.INVALID_STATUS);

        Visit visit = Visit.create(lockedRequest.getId(), volunteerId, checklistFactory.create(lockedRequest.getNeeds()));
        return VisitCreateResponse.from(visitRepository.save(visit));
    }

    @Transactional
    public CheckinResponse checkin(Long visitId, Long actorId, LocalDateTime requestedTime) {
        LockedVisit locked = loadForUpdate(visitId, actorId);
        Visit visit = locked.visit();
        Request request = locked.request();
        requireActiveRequest(request);

        if (visit.getStartedAt() != null)
            return new CheckinResponse(visit.getId(), visit.getStartedAt());
        if (request.getStatus() != RequestStatus.CONFIRMED && request.getStatus() != RequestStatus.IN_PROGRESS)
            throw new CustomException(ErrorCode.INVALID_STATUS);

        LocalDateTime now = LocalDateTime.now(visitClock).withNano(0);
        if (!request.getDate().equals(now.toLocalDate()))
            throw new CustomException(ErrorCode.INVALID_STATUS);
        LocalDateTime time = requestedTime == null ? now : requestedTime;
        if (!request.getDate().equals(time.toLocalDate()) || time.isAfter(now))
            throw new CustomException(ErrorCode.INVALID_INPUT);

        visit.checkin(time);
        if (request.getStatus() == RequestStatus.CONFIRMED)
            requestService.changeStatus(request.getId(), RequestStatus.CONFIRMED, RequestStatus.IN_PROGRESS);
        return new CheckinResponse(visit.getId(), visit.getStartedAt());
    }

    @Transactional
    public StepUpdateResponse updateStep(Long visitId, Long actorId, StepUpdateRequest update) {
        LockedVisit locked = loadForUpdate(visitId, actorId);
        if (update == null || update.step() == null || update.done() == null)
            throw new CustomException(ErrorCode.INVALID_INPUT);
        if (locked.request().getStatus() != RequestStatus.IN_PROGRESS)
            throw new CustomException(ErrorCode.INVALID_STATUS);
        Visit visit = locked.visit();
        visit.updateStep(update.step(), update.done(), LocalDateTime.now(visitClock).withNano(0));
        return new StepUpdateResponse(visit.getId(), visit.getStep());
    }

    @Transactional
    public CheckoutResponse checkout(Long visitId, Long actorId, LocalDateTime requestedTime) {
        LockedVisit locked = loadForUpdate(visitId, actorId);
        Visit visit = locked.visit();
        Request request = locked.request();
        requireActiveRequest(request);
        if (visit.getEndedAt() != null)
            return CheckoutResponse.from(visit);
        if (request.getStatus() != RequestStatus.IN_PROGRESS || visit.getStartedAt() == null)
            throw new CustomException(ErrorCode.INVALID_STATUS);

        LocalDateTime now = LocalDateTime.now(visitClock).withNano(0);
        LocalDateTime time = requestedTime == null ? now : requestedTime;
        if (time.isAfter(now))
            throw new CustomException(ErrorCode.INVALID_INPUT);
        visit.checkout(time, minutesCalculator.calculate(visit.getStartedAt(), time));

        boolean allEnded = visitRepository.findAllByRequestIdForUpdate(request.getId()).stream()
                .allMatch(participant -> participant.getEndedAt() != null);
        if (allEnded)
            requestService.changeStatus(request.getId(), RequestStatus.IN_PROGRESS, RequestStatus.COMPLETED);
        return CheckoutResponse.from(visit);
    }

    @Transactional
    public ApproveResponse approve(Long visitId, Long actorId) {
        return approve(visitId, actorId, null);
    }

    @Transactional
    public ApproveResponse approve(Long visitId, Long actorId, String thanks) {
        accessPolicy.requireAuthenticated(actorId);
        LockedVisit locked = loadForUpdate(visitId);
        Visit visit = locked.visit();
        Request request = locked.request();
        accessPolicy.requireRequester(request, actorId);
        if (request.getStatus() != RequestStatus.COMPLETED && request.getStatus() != RequestStatus.APPROVED)
            throw new CustomException(ErrorCode.INVALID_STATUS);
        if (visit.isApproved())
            return ApproveResponse.from(visit, request.getStatus());
        if (request.getStatus() != RequestStatus.COMPLETED)
            throw new CustomException(ErrorCode.INVALID_STATUS);

        visit.approve(actorId, LocalDateTime.now(visitClock).withNano(0), thanks);
        boolean allApproved = visitRepository.findAllByRequestIdForUpdate(request.getId()).stream()
                .allMatch(Visit::isApproved);
        if (allApproved)
            requestService.changeStatus(request.getId(), RequestStatus.COMPLETED, RequestStatus.APPROVED);
        return ApproveResponse.from(visit, request.getStatus());
    }

    private LockedVisit loadForUpdate(Long visitId, Long actorId) {
        accessPolicy.requireAuthenticated(actorId);
        LockedVisit locked = loadForUpdate(visitId);
        accessPolicy.requireVolunteer(locked.visit(), actorId);
        return locked;
    }

    private LockedVisit loadForUpdate(Long visitId) {
        Long requestId = visitRepository.findRequestIdByVisitId(visitId)
                .orElseThrow(() -> new CustomException(ErrorCode.VISIT_NOT_FOUND));
        Request request = requestService.getForUpdate(requestId);
        Visit visit = visitRepository.findByIdForUpdate(visitId)
                .orElseThrow(() -> new CustomException(ErrorCode.VISIT_NOT_FOUND));
        return new LockedVisit(visit, request);
    }

    private void requireActiveRequest(Request request) {
        if (request.getStatus() == RequestStatus.RECRUITING || request.getStatus() == RequestStatus.CANCELED)
            throw new CustomException(ErrorCode.INVALID_STATUS);
    }

    private record LockedVisit(Visit visit, Request request) {}
}
