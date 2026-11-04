package com.dandi.hospital.hospital.repository;

import com.dandi.hospital.hospital.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {}
