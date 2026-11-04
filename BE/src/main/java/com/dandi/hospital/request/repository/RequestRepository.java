package com.dandi.hospital.request.repository;

import com.dandi.hospital.request.entity.Request;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestRepository extends JpaRepository<Request, Long> {
}