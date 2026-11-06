package com.dandi.hospital.application.service;

import com.dandi.hospital.application.dto.ApplyRequestDto;
import com.dandi.hospital.application.dto.AcceptResult;
import com.dandi.hospital.application.dto.ApplicationItem;
import com.dandi.hospital.application.dto.ApplicationItem.VolunteerSummary;
import com.dandi.hospital.application.dto.ApplyResult;
import com.dandi.hospital.application.dto.MyApplicationItem;
import com.dandi.hospital.application.entity.Application;
import com.dandi.hospital.application.repository.ApplicationRepository;
import com.dandi.hospital.global.enums.ApplicationStatus;
import com.dandi.hospital.global.enums.RequestStatus;
import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.hospital.service.HospitalService;
import com.dandi.hospital.visit.entity.Visit;
import com.dandi.hospital.visit.repository.VisitRepository;
import com.dandi.hospital.visit.service.ChecklistFactory;
import com.dandi.hospital.volunteer.entity.Volunteer;
import com.dandi.hospital.request.repository.RequestRepository;
import com.dandi.hospital.volunteer.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final RequestRepository requestRepository;
    private final VolunteerRepository volunteerRepository;
    private final VisitRepository visitRepository;
    private final ChecklistFactory checklistFactory;
    private final HospitalService hospitalService;

    @Transactional
    public ApplyResult apply(Long volunteerId, Long requestId, ApplyRequestDto dto) {
        // 1. 프로필을 작성한 봉사자인지 확인
        if (volunteerRepository.findByUserId(volunteerId).isEmpty()) {
            throw new CustomException(ErrorCode.PROFILE_INCOMPLETE);
        }

        // 2. 요청이 있는지 확인
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.REQUEST_NOT_FOUND));

        // 3. 내가 등록한 요청인지 확인
        if (request.getGuardianId().equals(volunteerId)) {
            throw new CustomException(ErrorCode.OWN_REQUEST);
        }

        // 4. 모집 중인 요청인지 확인
        if (request.getStatus() != RequestStatus.RECRUITING) {
            throw new CustomException(ErrorCode.INVALID_STATUS);
        }

        // 5. 신청 저장
        Application saved = applicationRepository.save(Application.builder()
                .requestId(requestId)
                .volunteerId(volunteerId)
                .message(dto.message())
                .build());

        return new ApplyResult(saved.getId(), saved.getStatus());
    }

    /** 신청자 목록: 요청을 등록한 사람만 볼 수 있음 */
    @Transactional(readOnly = true)
    public List<ApplicationItem> getApplicants(Long userId, Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.REQUEST_NOT_FOUND));

        if (!request.getGuardianId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        return applicationRepository
                .findAllByRequestIdAndStatusNotOrderByIdAsc(requestId, ApplicationStatus.CANCELED)
                .stream()
                .map(this::toItem)
                .toList();
    }

    private ApplicationItem toItem(Application application) {
        Long volunteerUserId = application.getVolunteerId();
        Volunteer v = volunteerRepository.findByUserId(volunteerUserId)
                .orElseThrow(() -> new CustomException(ErrorCode.VOLUNTEER_NOT_FOUND));

        VolunteerSummary summary = new VolunteerSummary(
                volunteerUserId,
                v.getUser().getName(),
                v.getAge(),
                v.getGender(),
                v.getSchool(),
                v.getMajor(),
                v.getGrade(),
                v.getHometown(),
                v.getPhotoUrl(),
                v.isVerified(),
                applicationRepository.countByVolunteerIdAndStatus(volunteerUserId, ApplicationStatus.ACCEPTED)
        );

        return new ApplicationItem(
                application.getId(),
                application.getStatus(),
                application.getMessage(),
                application.getCreatedAt(),
                summary
        );
    }

    /**
     * 신청 수락 (요청을 등록한 사람만)
     * - 수락할 때마다 동행 기록(Visit)을 만들어 visitId를 돌려줌
     * - 수락 인원이 helpersNeeded에 닿으면 요청을 CONFIRMED로 바꾸고 남은 대기 신청은 CLOSED 처리
     */
    @Transactional
    public AcceptResult accept(Long userId, Long applicationId) {
        // 1. 신청이 있는지 확인
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));

        // 2. 요청을 잠그고 가져옴 (두 사람을 동시에 수락해도 정원이 넘지 않게)
        Request request = requestRepository.findByIdForUpdate(application.getRequestId())
                .orElseThrow(() -> new CustomException(ErrorCode.REQUEST_NOT_FOUND));

        // 3. 요청을 등록한 사람인지 확인
        if (!request.getGuardianId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        // 4. 모집 중인 요청이고, 대기 중인 신청인지 확인
        if (request.getStatus() != RequestStatus.RECRUITING
                || application.getStatus() != ApplicationStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_STATUS);
        }

        // 5. 봉사자가 같은 날 다른 동행이 확정되어 있는지 확인
        Long volunteerUserId = application.getVolunteerId();
        if (applicationRepository.countAcceptedOnSameDate(
                volunteerUserId, request.getDate(), request.getId(),
                ApplicationStatus.ACCEPTED, RequestStatus.CANCELED) > 0) {
            throw new CustomException(ErrorCode.SCHEDULE_CONFLICT);
        }

        // 6. 수락하고 동행 기록 생성
        application.changeStatus(ApplicationStatus.PENDING, ApplicationStatus.ACCEPTED);
        Visit visit = visitRepository.save(
                Visit.create(request.getId(), volunteerUserId, checklistFactory.create(request.getNeeds())));

        // 7. 정원이 차면 모집 마감
        long acceptedCount = applicationRepository.countByRequestIdAndStatus(
                request.getId(), ApplicationStatus.ACCEPTED);
        if (acceptedCount >= request.getHelpersNeeded()) {
            request.changeStatus(RequestStatus.RECRUITING, RequestStatus.CONFIRMED);
            applicationRepository.findAllByRequestIdAndStatus(request.getId(), ApplicationStatus.PENDING)
                    .forEach(a -> a.changeStatus(ApplicationStatus.PENDING, ApplicationStatus.CLOSED));
        }

        return new AcceptResult(request.getId(), request.getStatus(), visit.getId());
    }

    /** 내가 신청한 목록 (최근 순) */
    @Transactional(readOnly = true)
    public List<MyApplicationItem> getMine(Long userId) {
        return applicationRepository.findAllByVolunteerIdOrderByIdDesc(userId)
                .stream()
                .map(application -> toMyItem(application, userId))
                .toList();
    }

    private MyApplicationItem toMyItem(Application application, Long userId) {
        Request request = requestRepository.findById(application.getRequestId())
                .orElseThrow(() -> new CustomException(ErrorCode.REQUEST_NOT_FOUND));

        // 수락되어 동행 기록이 있으면 함께 보여 줌
        Visit visit = visitRepository.findAllByRequestIdOrderByIdAsc(request.getId()).stream()
                .filter(v -> v.getVolunteerId().equals(userId))
                .findFirst()
                .orElse(null);

        return new MyApplicationItem(
                application.getId(),
                application.getStatus(),
                request.getId(),
                visit == null ? null : visit.getId(),
                request.getDate(),
                request.getMeetTime(),
                hospitalService.getById(request.getHospitalId()).getName(),
                request.getStatus(),
                visit == null ? null : visit.getRecognizedMinutes(),
                visit != null && visit.getApprovedAt() != null ? visit.getRecognizedMinutes() : null
        );
    }
}
