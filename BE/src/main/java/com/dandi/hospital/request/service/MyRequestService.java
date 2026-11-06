package com.dandi.hospital.request.service;

import com.dandi.hospital.application.repository.ApplicationRepository;
import com.dandi.hospital.global.enums.ApplicationStatus;
import com.dandi.hospital.hospital.service.HospitalService;
import com.dandi.hospital.request.dto.MyRequestItem;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.repository.RequestRepository;
import com.dandi.hospital.senior.entity.Senior;
import com.dandi.hospital.senior.repository.SeniorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MyRequestService {

    private final RequestRepository requestRepository;
    private final SeniorRepository seniorRepository;
    private final HospitalService hospitalService;
    private final ApplicationRepository applicationRepository;

    /** 내가 등록한 요청 목록 (최근 날짜 순) */
    public List<MyRequestItem> getMine(Long userId) {
        return requestRepository.findAllByGuardianIdOrderByDateDescMeetTimeDesc(userId)
                .stream()
                .map(this::toItem)
                .toList();
    }

    private MyRequestItem toItem(Request request) {
        String seniorName = seniorRepository.findById(request.getSeniorId())
                .map(Senior::getName)
                .orElse("");

        return new MyRequestItem(
                request.getId(),
                seniorName,
                request.getDate(),
                hospitalService.getById(request.getHospitalId()).getName(),
                request.getStatus(),
                applicationRepository.countByRequestIdAndStatusIn(
                        request.getId(), List.of(ApplicationStatus.PENDING, ApplicationStatus.ACCEPTED))
        );
    }
}
