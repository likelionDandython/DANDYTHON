package com.dandi.hospital.application.service;

import com.dandi.hospital.application.dto.ApplyRequestDto;
import com.dandi.hospital.application.dto.ApplyResult;
import com.dandi.hospital.application.entity.Application;
import com.dandi.hospital.application.repository.ApplicationRepository;
import com.dandi.hospital.global.enums.ApplicationStatus;
import com.dandi.hospital.global.enums.RequestStatus;
import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.repository.RequestRepository;
import com.dandi.hospital.volunteer.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // 3. 모집 중인 요청인지 확인
        // 내가 등록한 요청인지 확인
        if (request.getGuardianId().equals(volunteerId)) {
            throw new CustomException(ErrorCode.OWN_REQUEST);
        }

        // 4. 이미 신청했는지 확인 (취소한 신청은 제외)
        boolean alreadyApplied = applicationRepository.existsByRequestIdAndVolunteerIdAndStatusNot(
                requestId, volunteerId, ApplicationStatus.CANCELED);
        if (alreadyApplied) {
            throw new CustomException(ErrorCode.ALREADY_APPLIED);
        }

        // 5. 신청 저장
        Application saved = applicationRepository.save(Application.builder()
                .requestId(requestId)
                .volunteerId(volunteerId)
                .message(dto.message())
                .build());

        return new ApplyResult(saved.getId(), saved.getStatus());
    }
}