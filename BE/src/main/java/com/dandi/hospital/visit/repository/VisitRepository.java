package com.dandi.hospital.visit.repository;

import com.dandi.hospital.visit.entity.Visit;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface VisitRepository extends JpaRepository<Visit, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Visit> findByRequestIdAndVolunteerId(Long requestId, Long volunteerId);

    @Query("select v.requestId from Visit v where v.id = :visitId")
    Optional<Long> findRequestIdByVisitId(@Param("visitId") Long visitId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Visit v where v.id = :visitId")
    Optional<Visit> findByIdForUpdate(@Param("visitId") Long visitId);
}
