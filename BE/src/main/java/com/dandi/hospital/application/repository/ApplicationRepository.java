package com.dandi.hospital.application.repository;

import com.dandi.hospital.application.entity.Application;
import com.dandi.hospital.global.enums.ApplicationStatus;
import com.dandi.hospital.global.enums.RequestStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

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


    // 요청별 여러 상태의 신청 수
    long countByRequestIdAndStatusIn(Long requestId, Collection<ApplicationStatus> statuses);

    // 내가 신청한 목록 (최근 순)
    List<Application> findAllByVolunteerIdOrderByIdDesc(Long volunteerId);

    // ── 동시성 처리용 (요청을 잠근 뒤 최신 상태를 읽기 위한 잠금 조회) ──

    // 신청이 속한 요청 번호만 조회 (엔티티를 불러오지 않음)
    @Query("select a.requestId from Application a where a.id = :applicationId")
    Optional<Long> findRequestIdById(@Param("applicationId") Long applicationId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Application a where a.id = :applicationId")
    Optional<Application> findByIdForUpdate(@Param("applicationId") Long applicationId);

    // 요청별 특정 상태의 신청 수 (정원 집계)
    long countByRequestIdAndStatus(Long requestId, ApplicationStatus status);

    // 봉사자의 특정 상태 신청 목록 (일정 검사, 봉사자 잠금 후 사용)
    List<Application> findAllByVolunteerIdAndStatus(Long volunteerId, ApplicationStatus status);
}
