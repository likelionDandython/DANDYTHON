package com.dandi.hospital.senior.repository;

import com.dandi.hospital.senior.entity.Senior;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeniorRepository extends JpaRepository<Senior, Long> {
    List<Senior> findAllByGuardianIdOrderByIdDesc(Long guardianId);
}
