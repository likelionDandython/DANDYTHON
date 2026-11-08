package com.dandi.hospital.notification.repository;

import com.dandi.hospital.notification.entity.PushDelivery;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.*;

public interface PushDeliveryRepository extends JpaRepository<PushDelivery, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from PushDelivery d where d.id = :id")
    Optional<PushDelivery> findByIdForUpdate(@Param("id") Long id);

    @Query("select d.id from PushDelivery d where d.status in :statuses and d.nextAttemptAt <= :now order by d.id")
    List<Long> findDue(@Param("statuses") Collection<PushDelivery.Status> statuses,
                       @Param("now") LocalDateTime now, Pageable pageable);

    List<PushDelivery> findAllByNotificationId(Long notificationId);
}
