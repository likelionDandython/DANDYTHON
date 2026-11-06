package com.dandi.hospital.request.service;

import com.dandi.hospital.application.entity.Application;
import com.dandi.hospital.application.repository.ApplicationRepository;
import com.dandi.hospital.global.enums.ApplicationStatus;
import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.hospital.entity.Hospital;
import com.dandi.hospital.hospital.service.HospitalService;
import com.dandi.hospital.request.dto.RequestDetail;
import com.dandi.hospital.request.dto.RequestDetail.ContactInfo;
import com.dandi.hospital.request.dto.RequestDetail.HospitalInfo;
import com.dandi.hospital.request.dto.RequestDetail.SeniorInfo;
import com.dandi.hospital.request.dto.RequestDetail.VolunteerInfo;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.repository.RequestRepository;
import com.dandi.hospital.senior.entity.Senior;
import com.dandi.hospital.senior.repository.SeniorRepository;
import com.dandi.hospital.user.entity.User;
import com.dandi.hospital.user.repository.UserRepository;
import com.dandi.hospital.visit.entity.Visit;
import com.dandi.hospital.visit.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RequestDetailService {

    private final RequestRepository requestRepository;
    private final SeniorRepository seniorRepository;
    private final HospitalService hospitalService;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final VisitRepository visitRepository;

    public RequestDetail getDetail(Long userId, Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.REQUEST_NOT_FOUND));
        Senior senior = seniorRepository.findById(request.getSeniorId())
                .orElseThrow(() -> new CustomException(ErrorCode.SENIOR_NOT_FOUND));
        Hospital hospital = hospitalService.getById(request.getHospitalId());

        // 수락된 봉사자 ID 목록
        List<Long> acceptedIds = applicationRepository
                .findAllByRequestIdAndStatus(requestId, ApplicationStatus.ACCEPTED)
                .stream()
                .map(Application::getVolunteerId)
                .toList();

        boolean isRequester = request.getGuardianId().equals(userId);
        boolean isMatched = acceptedIds.contains(userId);
        boolean canSeeContact = isRequester || isMatched; // 연락처·주소 공개 대상

        return new RequestDetail(
                request.getId(),
                request.getStatus(),
                request.getGuardianId(),
                RequestBoardService.EXPECTED_HOURS,
                new SeniorInfo(
                        canSeeContact ? senior.getName() : maskName(senior.getName()),
                        senior.getAge(),
                        senior.getRegion(),
                        canSeeContact ? senior.getPhone() : null),
                request.getDate(),
                request.getMeetTime(),
                request.getMeetPlaceType(),
                canSeeContact ? request.getMeetAddress() : null,
                new HospitalInfo(hospital.getId(), hospital.getName()),
                request.getDepartment(),
                List.copyOf(request.getNeeds()),
                request.getNotes(),
                request.getHelpersNeeded(),
                request.getGenderPref(),
                canSeeContact ? guardianOf(request) : null,
                canSeeContact ? volunteersOf(acceptedIds) : null,
                canSeeContact ? visitIdFor(requestId, userId, isRequester) : null
        );
    }

    private ContactInfo guardianOf(Request request) {
        return userRepository.findById(request.getGuardianId())
                .map(u -> new ContactInfo(u.getName(), u.getPhone()))
                .orElse(null);
    }

    private List<VolunteerInfo> volunteersOf(List<Long> volunteerIds) {
        return userRepository.findAllById(volunteerIds).stream()
                .map(u -> new VolunteerInfo(u.getId(), u.getName(), u.getPhone()))
                .toList();
    }

    /** 봉사자는 내 동행 기록, 요청자는 첫 번째 동행 기록 */
    private Long visitIdFor(Long requestId, Long userId, boolean isRequester) {
        List<Visit> visits = visitRepository.findAllByRequestIdOrderByIdAsc(requestId);
        return visits.stream()
                .filter(v -> isRequester || Objects.equals(v.getVolunteerId(), userId))
                .map(Visit::getId)
                .findFirst()
                .orElse(null);
    }

    /** 홍길동 → 홍○○ */
    private String maskName(String name) {
        if (name == null || name.isEmpty()) return name;
        return name.charAt(0) + "○".repeat(name.length() - 1);
    }
}
