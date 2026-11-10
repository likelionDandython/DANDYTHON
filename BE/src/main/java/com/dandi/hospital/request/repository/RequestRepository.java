package com.dandi.hospital.request.repository;

import com.dandi.hospital.global.enums.RequestStatus;
import com.dandi.hospital.request.entity.Request;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RequestRepository extends JpaRepository<Request, Long> {

    List<Request> findAllByStatusOrderByDateAscMeetTimeAsc(RequestStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Request r where r.id = :requestId")
    Optional<Request> findByIdForUpdate(@Param("requestId") Long requestId);

    // 내가 등록한 요청 목록 (최근 날짜 순)
    List<Request> findAllByGuardianIdOrderByDateDescMeetTimeDesc(Long guardianId);
}
