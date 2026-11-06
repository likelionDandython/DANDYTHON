package com.dandi.hospital.application.service;

import com.dandi.hospital.application.dto.ApplyRequestDto;
import com.dandi.hospital.application.dto.ApplicationItem;
import com.dandi.hospital.application.dto.ApplicationItem.VolunteerSummary;
import com.dandi.hospital.application.dto.ApplyResult;
import com.dandi.hospital.application.entity.Application;
import com.dandi.hospital.application.repository.ApplicationRepository;
import com.dandi.hospital.global.enums.ApplicationStatus;
import com.dandi.hospital.global.enums.RequestStatus;
import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.request.entity.Request;
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
}
