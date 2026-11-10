package com.dandi.hospital.notification.repository;

import com.dandi.hospital.notification.entity.PushRegistration;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface PushRegistrationRepository extends JpaRepository<PushRegistration, Long> {
    List<PushRegistration> findAllByUserIdAndActiveTrueOrderByIdAsc(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PushRegistration p where p.id = :id")
    Optional<PushRegistration> findByIdForUpdate(@Param("id") Long id);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PushRegistration p where p.deviceId = :deviceId")
    Optional<PushRegistration> findByDeviceIdForUpdate(@Param("deviceId") String deviceId);

    Optional<PushRegistration> findByTargetHash(String targetHash);
}
