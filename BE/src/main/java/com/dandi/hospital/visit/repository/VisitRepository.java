package com.dandi.hospital.visit.repository;

import com.dandi.hospital.visit.entity.Visit;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface VisitRepository extends JpaRepository<Visit, Long> {
    // MySQL REPEATABLE READ에서도 수락 트랜잭션의 과거 스냅샷 대신 최신 행을 확인한다.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Visit> findByRequestIdAndVolunteerId(Long requestId, Long volunteerId);
}
