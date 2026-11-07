package com.dandi.hospital.visit.repository;

import com.dandi.hospital.visit.entity.Visit;
import com.dandi.hospital.visit.dto.VisitThanksMessage;
import com.dandi.hospital.visit.dto.VisitTimeView;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;
import java.util.Collection;

public interface VisitRepository extends JpaRepository<Visit, Long> {
    interface ApprovedVisitTotals {
        long getVisitCount();
        long getTotalMinutes();
    }

    @Query("select count(v) as visitCount, coalesce(sum(v.approvedMinutes), 0) as totalMinutes "
            + "from Visit v where v.volunteerId = :volunteerId and v.approvedAt is not null")
    ApprovedVisitTotals summarizeApprovedByVolunteer(@Param("volunteerId") Long volunteerId);

    @Query("select new com.dandi.hospital.visit.dto.VisitThanksMessage(v.thanks, v.thanksCreatedAt) "
            + "from Visit v where v.volunteerId = :volunteerId and v.approvedAt is not null "
            + "and v.thanks is not null and trim(v.thanks) <> '' and v.thanksCreatedAt is not null "
            + "order by v.thanksCreatedAt desc, v.id desc")
    List<VisitThanksMessage> findThanksByVolunteer(@Param("volunteerId") Long volunteerId);

    @Query("select new com.dandi.hospital.visit.dto.VisitTimeView("
            + "v.id, v.requestId, v.volunteerId, v.recognizedMinutes, v.approvedMinutes) "
            + "from Visit v where v.id in :visitIds")
    List<VisitTimeView> findTimesByVisitIds(@Param("visitIds") Collection<Long> visitIds);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Visit> findByRequestIdAndVolunteerId(Long requestId, Long volunteerId);

    @Query("select v.requestId from Visit v where v.id = :visitId")
    Optional<Long> findRequestIdByVisitId(@Param("visitId") Long visitId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Visit v where v.id = :visitId")
    Optional<Visit> findByIdForUpdate(@Param("visitId") Long visitId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Visit v where v.requestId = :requestId order by v.id")
    List<Visit> findAllByRequestIdForUpdate(@Param("requestId") Long requestId);

    // 요청 상세 조회용 (잠금 없음)
    List<Visit> findAllByRequestIdOrderByIdAsc(Long requestId);
}
