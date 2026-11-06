package com.dandi.hospital.request.service;

import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.global.enums.RequestStatus;
import com.dandi.hospital.hospital.service.HospitalService;
import com.dandi.hospital.request.dto.CreateRequestDto;
import com.dandi.hospital.request.dto.CreateRequestResult;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.entity.RequestTargetType;
import com.dandi.hospital.request.repository.RequestRepository;
import com.dandi.hospital.senior.service.SeniorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository requestRepository;
    private final SeniorService seniorService;
    private final HospitalService hospitalService;

    @Transactional(readOnly = true)
    public Request getById(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.REQUEST_NOT_FOUND));
    }

    @Transactional
    public Request getForVisitCreation(Long requestId) {
        return getForUpdate(requestId);
    }

    @Transactional
    public Request getForUpdate(Long requestId) {
        return requestRepository.findByIdForUpdate(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.REQUEST_NOT_FOUND));
    }

    @Transactional
    public void changeStatus(Long requestId, RequestStatus expected, RequestStatus next) {
        getForUpdate(requestId).changeStatus(expected, next);
    }

    @Transactional
    public CreateRequestResult create(Long guardianId, CreateRequestDto dto) {
        RequestTargetType targetType = dto.targetType() == null ? RequestTargetType.FAMILY : dto.targetType();
        if (targetType == RequestTargetType.FAMILY) {
            if (dto.seniorId() == null)
                throw new CustomException(ErrorCode.INVALID_INPUT);    // 가족 요청은 어르신 선택 필수
            seniorService.getOwnedSenior(dto.seniorId(), guardianId); // 없으면 404, 남의 어르신이면 403
        }
        hospitalService.getById(dto.hospitalId());                // 없으면 404

        Request request = Request.builder()
                .guardianId(guardianId)
                .targetType(targetType)
                .seniorId(targetType == RequestTargetType.FAMILY ? dto.seniorId() : null)
                .travelMode(dto.travelMode())
                .hospitalId(dto.hospitalId())
                .date(dto.date())
                .meetTime(dto.meetTime())
                .meetPlaceType(dto.meetPlaceType())
                .meetAddress(dto.meetAddress())
                .department(dto.department())
                .needs(dto.needs())
                .notes(dto.notes())
                .helpersNeeded(dto.helpersNeeded())
                .genderPref(dto.genderPref())
                .build();

        Request saved = requestRepository.save(request);
        return new CreateRequestResult(saved.getId(), saved.getStatus());
    }
}
