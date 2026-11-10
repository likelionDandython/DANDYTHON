package com.dandi.hospital.volunteer.repository;

import com.dandi.hospital.volunteer.entity.Volunteer;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
    Optional<Volunteer> findByUserId(Long userId);

    // 같은 봉사자를 동시에 수락할 때 순서를 지키기 위한 잠금 (B 신청 수락에서 사용)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Volunteer v where v.user.id = :userId")
    Optional<Volunteer> findByUserIdForUpdate(@Param("userId") Long userId);
}
