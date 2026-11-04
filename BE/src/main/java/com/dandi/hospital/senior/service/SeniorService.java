package com.dandi.hospital.senior.service;

import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.senior.dto.SeniorCreateRequest;
import com.dandi.hospital.senior.dto.SeniorCreateResponse;
import com.dandi.hospital.senior.dto.SeniorResponse;
import com.dandi.hospital.senior.entity.Senior;
import com.dandi.hospital.senior.repository.SeniorRepository;
import com.dandi.hospital.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SeniorService {

    private final SeniorRepository seniorRepository;
    private final UserRepository userRepository;

    @Transactional
    public SeniorCreateResponse create(Long guardianId, SeniorCreateRequest req) {
        Senior senior = seniorRepository.save(Senior.builder()
                .guardian(userRepository.getReferenceById(guardianId))
                .name(req.name())
                .age(req.age())
                .phone(req.phone() == null || req.phone().isBlank() ? null : req.phone())
                .region(req.region())
                .build());
        return new SeniorCreateResponse(senior.getId());
    }

    public List<SeniorResponse> getMySeniors(Long guardianId) {
        return seniorRepository.findAllByGuardianIdOrderByIdDesc(guardianId).stream()
                .map(SeniorResponse::from)
                .toList();
    }

    /**
     * B(요청 등록)에서 사용: 내가 등록한 어르신인지까지 확인해서 반환
     * 없으면 SENIOR_NOT_FOUND, 남의 어르신이면 FORBIDDEN
     */
    public Senior getOwnedSenior(Long seniorId, Long guardianId) {
        Senior senior = seniorRepository.findById(seniorId)
                .orElseThrow(() -> new CustomException(ErrorCode.SENIOR_NOT_FOUND));
        if (!senior.isOwnedBy(guardianId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        return senior;
    }
}
