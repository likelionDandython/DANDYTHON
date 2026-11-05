package com.dandi.hospital.visit.service;

import com.dandi.hospital.global.enums.RequestStatus;
import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.service.RequestService;
import com.dandi.hospital.visit.dto.VisitCreateResponse;
import com.dandi.hospital.visit.entity.Visit;
import com.dandi.hospital.visit.repository.VisitRepository;
import com.dandi.hospital.volunteer.entity.Volunteer;
import com.dandi.hospital.volunteer.service.VolunteerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VisitService {
    private final VisitRepository visitRepository;
    private final ChecklistFactory checklistFactory;
    private final RequestService requestService;
    private final VolunteerService volunteerService;

    /**
     * B의 수락 트랜잭션에서 인원 충족·CONFIRMED 전이 후 호출한다.
     * B가 수락 관계와 정원을 검사하고, C는 확정 상태·저장된 프로필을 다시 확인한다.
     * 기존 트랜잭션에 참여하므로 수락 실패 시 Visit도 함께 롤백된다.
     */
    @Transactional
    public VisitCreateResponse create(Request request, Volunteer volunteer) {
        if (request == null || request.getId() == null || volunteer == null
                || volunteer.getId() == null || volunteer.getUser() == null
                || volunteer.getUser().getId() == null) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // 기존 Visit이 없는 첫 생성도 직렬화한다. 잠금 순서는 Request → Visit이다.
        Request lockedRequest = requestService.getForVisitCreation(request.getId());
        Long volunteerId = volunteerService.getByUserId(volunteer.getUser().getId()).getUser().getId();

        if (lockedRequest.getGuardianId().equals(volunteerId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        // 처리된 수락 요청의 재호출은 체크인 이후에도 기존 기록을 반환한다.
        var existing = visitRepository.findByRequestIdAndVolunteerId(lockedRequest.getId(), volunteerId);
        if (existing.isPresent()) {
            if (lockedRequest.getStatus() == RequestStatus.CANCELED
                    || lockedRequest.getStatus() == RequestStatus.RECRUITING) {
                throw new CustomException(ErrorCode.INVALID_STATUS);
            }
            return VisitCreateResponse.from(existing.get());
        }

        if (lockedRequest.getStatus() != RequestStatus.CONFIRMED) {
            throw new CustomException(ErrorCode.INVALID_STATUS);
        }

        Visit visit = Visit.create(lockedRequest.getId(), volunteerId,
                checklistFactory.create(lockedRequest.getNeeds()));
        return VisitCreateResponse.from(visitRepository.save(visit));
    }
}
