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

    // 요청별 신청 목록 (취소 제외, 먼저 신청한 순)
    List<Application> findAllByRequestIdAndStatusNotOrderByIdAsc(Long requestId, ApplicationStatus status);

    // 봉사자의 수락된 동행 수
    long countByVolunteerIdAndStatus(Long volunteerId, ApplicationStatus status);
}
