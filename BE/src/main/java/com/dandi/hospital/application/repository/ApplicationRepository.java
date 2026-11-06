package com.dandi.hospital.application.repository;

import com.dandi.hospital.application.entity.Application;
import com.dandi.hospital.global.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // 취소하지 않은 신청이 이미 있는지 확인
    boolean existsByRequestIdAndVolunteerIdAndStatusNot(
            Long requestId, Long volunteerId, ApplicationStatus status);

    // 요청별 특정 상태의 신청 목록 (예: 수락된 봉사자)
    List<Application> findAllByRequestIdAndStatus(Long requestId, ApplicationStatus status);
}
