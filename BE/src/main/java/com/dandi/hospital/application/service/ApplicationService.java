package com.dandi.hospital.application.service;

import com.dandi.hospital.application.dto.ApplyRequestDto;
import com.dandi.hospital.application.dto.AcceptResult;
import com.dandi.hospital.application.dto.ApplicationItem;
import com.dandi.hospital.application.dto.ApplicationItem.VolunteerSummary;
import com.dandi.hospital.application.dto.ApplyResult;
import com.dandi.hospital.application.dto.CancelApplicationResult;
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
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import com.dandi.hospital.notification.dto.NotificationCommand;
import com.dandi.hospital.notification.entity.NotificationType;
import com.dandi.hospital.notification.event.NotificationEvents;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final RequestRepository requestRepository;
    private final VolunteerRepository volunteerRepository;
    private final VisitRepository visitRepository;
    private final ChecklistFactory checklistFactory;
    private final HospitalService hospitalService;
    private final ApplicationEventPublisher events;

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

        notify(NotificationType.APPLICATION_RECEIVED, request.getGuardianId(), requestId, null, saved.getId(), "application:" + saved.getId() + ":received");
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
     *
     * 동시성
     * - 잠금은 "요청 → 봉사자" 두 개만, 항상 이 순서로 잡음 (다른 요청의 신청 행은 잠그지 않아 교착이 생기지 않음)
     * - READ_COMMITTED로 실행해서, 잠금을 잡은 뒤의 일반 조회도 항상 최신 커밋을 읽음
     *   · 같은 요청의 수락·취소는 요청 잠금으로 한 줄로 처리됨 → 정원 집계가 정확함
     *   · 같은 봉사자의 수락은 봉사자 잠금으로 한 줄로 처리됨 → 일정 검사가 정확함
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AcceptResult accept(Long userId, Long applicationId) {
        // 1. 요청 번호만 먼저 확인 (엔티티를 미리 불러오지 않음)
        Long requestId = applicationRepository.findRequestIdById(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));

        // 2. 요청을 잠금 (같은 요청의 수락·취소는 한 번에 하나씩)
        Request request = requestRepository.findByIdForUpdate(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.REQUEST_NOT_FOUND));

        // 3. 잠근 뒤 신청을 최신 상태로 다시 읽음
        Application application = applicationRepository.findByIdForUpdate(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));

        // 4. 요청을 등록한 사람인지 확인
        if (!request.getGuardianId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        // 5. 모집 중인 요청이고, 대기 중인 신청인지 확인
        if (request.getStatus() != RequestStatus.RECRUITING
                || application.getStatus() != ApplicationStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_STATUS);
        }

        // 6. 봉사자를 잠그고, 같은 날 다른 확정 동행이 있는지 확인
        //    (봉사자 잠금으로 같은 봉사자의 수락이 한 줄로 처리되어 한쪽만 성공)
        Long volunteerUserId = application.getVolunteerId();
        volunteerRepository.findByUserIdForUpdate(volunteerUserId)
                .orElseThrow(() -> new CustomException(ErrorCode.VOLUNTEER_NOT_FOUND));
        boolean conflict = applicationRepository
                .findAllByVolunteerIdAndStatus(volunteerUserId, ApplicationStatus.ACCEPTED)
                .stream()
                .filter(a -> !a.getRequestId().equals(request.getId()))
                .map(a -> requestRepository.findById(a.getRequestId()).orElse(null))
                .anyMatch(r -> r != null
                        && r.getStatus() != RequestStatus.CANCELED
                        && r.getDate().equals(request.getDate()));
        if (conflict) {
            throw new CustomException(ErrorCode.SCHEDULE_CONFLICT);
        }

        // 7. 수락하고 동행 기록 생성
        application.changeStatus(ApplicationStatus.PENDING, ApplicationStatus.ACCEPTED);
        Visit visit = visitRepository.save(
                Visit.create(request.getId(), volunteerUserId, checklistFactory.create(request.getNeeds())));

        // 8. 정원이 차면 모집 마감 (요청 잠금 + READ_COMMITTED라 최신 수락 인원을 셈)
        long acceptedCount = applicationRepository.countByRequestIdAndStatus(
                request.getId(), ApplicationStatus.ACCEPTED);
        if (acceptedCount > request.getHelpersNeeded()) {
            // 정상이라면 일어날 수 없음: 혹시라도 정원을 넘으면 이번 수락을 되돌림
            throw new CustomException(ErrorCode.INVALID_STATUS);
        }
        if (acceptedCount == request.getHelpersNeeded()) {
            request.changeStatus(RequestStatus.RECRUITING, RequestStatus.CONFIRMED);
            applicationRepository.findAllByRequestIdAndStatus(request.getId(), ApplicationStatus.PENDING)
                    .forEach(a -> a.changeStatus(ApplicationStatus.PENDING, ApplicationStatus.CLOSED));
            String eventKey = "request:" + requestId + ":confirmed:" + applicationId;
            notify(NotificationType.MATCH_CONFIRMED, request.getGuardianId(), requestId, visit.getId(), applicationId, eventKey);
            visitRepository.findAllByRequestIdOrderByIdAsc(requestId).forEach(participant ->
                    notify(NotificationType.MATCH_CONFIRMED, participant.getVolunteerId(), requestId,
                            participant.getId(), applicationId, eventKey));
        }

        notify(NotificationType.APPLICATION_ACCEPTED, volunteerUserId, requestId, visit.getId(), applicationId,
                "application:" + applicationId + ":accepted");

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

    /**
     * 신청 취소 (신청한 봉사자만)
     * - 대기 중 또는 수락된 신청만 취소 가능, 동행이 시작된 요청은 불가
     * - 수락된 신청이면 동행 기록을 지우고, 확정된 요청은 다시 모집 중으로 되돌림
     *   (정원이 차서 CLOSED 됐던 신청도 다시 대기 중으로 돌려 보호자가 다시 고를 수 있게 함)
     * - 수락된 신청을 동행일 2일 이내에 취소하면 lateCancel = true
     *
     * 동시성: 수락과 같은 요청 잠금으로 한 줄로 처리하고, READ_COMMITTED로 잠금 뒤 최신 상태를 읽음
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public CancelApplicationResult cancel(Long userId, Long applicationId) {
        Long requestId = applicationRepository.findRequestIdById(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));

        Request request = requestRepository.findByIdForUpdate(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.REQUEST_NOT_FOUND));

        Application application = applicationRepository.findByIdForUpdate(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));

        if (!application.getVolunteerId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        if (request.getStatus() != RequestStatus.RECRUITING && request.getStatus() != RequestStatus.CONFIRMED) {
            throw new CustomException(ErrorCode.INVALID_STATUS);
        }

        ApplicationStatus current = application.getStatus();
        if (current != ApplicationStatus.PENDING && current != ApplicationStatus.ACCEPTED) {
            throw new CustomException(ErrorCode.INVALID_STATUS);
        }

        boolean lateCancel = false;
        if (current == ApplicationStatus.ACCEPTED) {
            // 내 동행 기록 삭제 (잠금 조회로 최신 기록을 읽음, 아직 시작 전이어야 함)
            visitRepository.findAllByRequestIdForUpdate(request.getId()).stream()
                    .filter(v -> v.getVolunteerId().equals(userId))
                    .forEach(v -> {
                        if (v.getStartedAt() != null) throw new CustomException(ErrorCode.INVALID_STATUS);
                        visitRepository.delete(v);
                    });

            // 확정됐던 요청은 다시 모집 중으로
            if (request.getStatus() == RequestStatus.CONFIRMED) {
                request.changeStatus(RequestStatus.CONFIRMED, RequestStatus.RECRUITING);
                applicationRepository.findAllByRequestIdAndStatus(request.getId(), ApplicationStatus.CLOSED)
                        .forEach(a -> a.changeStatus(ApplicationStatus.CLOSED, ApplicationStatus.PENDING));
            }

            LocalDate today = LocalDate.now(ZoneId.of("Asia/Seoul"));
            lateCancel = !request.getDate().isAfter(today.plusDays(2));
        }

        application.changeStatus(current, ApplicationStatus.CANCELED);
        notify(NotificationType.APPLICATION_CANCELED, request.getGuardianId(), requestId, null, applicationId,
                "application:" + applicationId + ":canceled");
        return new CancelApplicationResult(application.getId(), application.getStatus(), lateCancel);
    }

    private void notify(NotificationType type, Long recipient, Long requestId, Long visitId, Long applicationId, String eventKey) {
        NotificationEvents.publish(events, new NotificationCommand(eventKey, type, recipient, requestId, visitId, applicationId));
    }
}
