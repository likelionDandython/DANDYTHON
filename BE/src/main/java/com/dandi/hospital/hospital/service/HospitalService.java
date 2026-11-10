package com.dandi.hospital.hospital.service;

import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.hospital.dto.HospitalResponse;
import com.dandi.hospital.hospital.entity.Hospital;
import com.dandi.hospital.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public List<HospitalResponse> getAll() {
        return hospitalRepository.findAll().stream().map(HospitalResponse::from).toList();
    }

    /** B(요청 등록)에서 사용: 없는 병원이면 HOSPITAL_NOT_FOUND */
    public Hospital getById(Long hospitalId) {
        return hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new CustomException(ErrorCode.HOSPITAL_NOT_FOUND));
    }
}
