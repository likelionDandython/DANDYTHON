package com.dandi.hospital.request.repository;

import com.dandi.hospital.global.enums.RequestStatus;
import com.dandi.hospital.request.entity.Request;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findAllByStatusOrderByDateAscMeetTimeAsc(RequestStatus status);
}