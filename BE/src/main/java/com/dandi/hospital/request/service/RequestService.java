package com.dandi.hospital.request.service;

import com.dandi.hospital.request.dto.CreateRequestDto;
import com.dandi.hospital.request.dto.CreateRequestResult;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository requestRepository;

    @Transactional
    public CreateRequestResult create(Long guardianId, CreateRequestDto dto) {
        Request request = Request.builder()
                .guardianId(guardianId)
                .seniorId(dto.seniorId())
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