package com.dandi.hospital.notification.repository;

import com.dandi.hospital.notification.entity.UserNotification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.*;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    Optional<UserNotification> findByEventKeyAndUserId(String eventKey, Long userId);
    List<UserNotification> findAllByUserIdOrderByIdDesc(Long userId, Pageable pageable);
    long countByUserIdAndReadFalse(Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update UserNotification n set n.read = true, n.readAt = :now where n.id = :id and n.userId = :userId and n.read = false")
    int markRead(@Param("id") Long id, @Param("userId") Long userId, @Param("now") LocalDateTime now);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update UserNotification n set n.read = true, n.readAt = :now where n.userId = :userId and n.read = false")
    int markAllRead(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
