package com.dandi.hospital.request.service;

import com.dandi.hospital.application.repository.ApplicationRepository;
import com.dandi.hospital.global.enums.ApplicationStatus;
import com.dandi.hospital.global.enums.RequestStatus;
import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.request.dto.CancelRequestResult;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import org.springframework.context.ApplicationEventPublisher;
import com.dandi.hospital.notification.dto.NotificationCommand;
import com.dandi.hospital.notification.entity.NotificationType;
import com.dandi.hospital.notification.event.NotificationEvents;
import com.dandi.hospital.visit.repository.VisitRepository;

@Service
@RequiredArgsConstructor
public class RequestCancelService {

    private final RequestRepository requestRepository;
    private final ApplicationRepository applicationRepository;
    private final VisitRepository visitRepository;
    private final ApplicationEventPublisher events;

    /**
     * 요청 취소 (요청을 등록한 사람만)
     * - 모집 중 또는 확정 상태에서만 취소 가능 (동행이 시작되면 불가)
     * - 대기 중인 신청은 CLOSED 처리
     * - 동행일 2일 이내 취소면 lateCancel = true
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public CancelRequestResult cancel(Long userId, Long requestId) {
        Request request = requestRepository.findByIdForUpdate(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.REQUEST_NOT_FOUND));

        if (!request.getGuardianId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        RequestStatus current = request.getStatus();
        if (current != RequestStatus.RECRUITING && current != RequestStatus.CONFIRMED) {
            throw new CustomException(ErrorCode.INVALID_STATUS);
        }

        var affected = new ArrayList<>(applicationRepository.findAllByRequestIdAndStatus(requestId, ApplicationStatus.PENDING));
        affected.addAll(applicationRepository.findAllByRequestIdAndStatus(requestId, ApplicationStatus.ACCEPTED));
        request.changeStatus(current, RequestStatus.CANCELED);
        applicationRepository.findAllByRequestIdAndStatus(requestId, ApplicationStatus.PENDING)
                .forEach(a -> a.changeStatus(ApplicationStatus.PENDING, ApplicationStatus.CLOSED));

        var visits = visitRepository.findAllByRequestIdOrderByIdAsc(requestId);
        Set<Long> recipients = new HashSet<>();
        for (var application : affected) {
            if (!recipients.add(application.getVolunteerId())) continue;
            Long visitId = visits.stream().filter(visit -> visit.getVolunteerId().equals(application.getVolunteerId()))
                    .map(visit -> visit.getId()).findFirst().orElse(null);
            NotificationEvents.publish(events, new NotificationCommand("request:" + requestId + ":canceled",
                    NotificationType.REQUEST_CANCELED, application.getVolunteerId(), requestId, visitId, application.getId()));
        }

        return new CancelRequestResult(requestId, request.getStatus(), isLate(request.getDate()));
    }

    /** 동행일까지 2일 이내면 늦은 취소 */
    static boolean isLate(LocalDate date) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Seoul"));
        return !date.isAfter(today.plusDays(2));
    }
}
