package com.dandi.hospital.notification.service;

import com.dandi.hospital.global.enums.*;
import com.dandi.hospital.notification.dto.NotificationCommand;
import com.dandi.hospital.notification.entity.NotificationType;
import com.dandi.hospital.request.entity.RequestTargetType;
import com.dandi.hospital.request.repository.RequestRepository;
import com.dandi.hospital.user.entity.ConsentItem;
import com.dandi.hospital.user.repository.ConsentRepository;
import com.dandi.hospital.visit.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import com.dandi.hospital.application.repository.ApplicationRepository;
import com.dandi.hospital.request.entity.Request;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationEligibility {
    private final RequestRepository requests;
    private final VisitRepository visits;
    private final ConsentRepository consents;
    private final ApplicationRepository applications;

    public boolean permits(NotificationCommand command) {
        var request = requests.findById(command.requestId()).orElse(null);
        if (request == null) return false;
        if (switch (command.type()) {
            case APPLICATION_RECEIVED, APPLICATION_ACCEPTED, APPLICATION_CLOSED, MATCH_CONFIRMED, APPLICATION_CANCELED, REQUEST_CANCELED -> true;
            default -> false;
        }) return permitsMatching(command, request);
        if (request.getStatus() == RequestStatus.CANCELED || command.visitId() == null) return false;
        var visit = visits.findById(command.visitId()).orElse(null);
        if (visit == null || !visit.getRequestId().equals(request.getId())) return false;
        if (command.type() == NotificationType.VISIT_APPROVED)
            return visit.isApproved() && visit.getVolunteerId().equals(command.recipientUserId());
        if (!request.getGuardianId().equals(command.recipientUserId()) || visit.getStartedAt() == null) return false;
        if (command.type() == NotificationType.SUMMARY_READY)
            return visit.isConsent() && visit.hasSummary() && Objects.equals(visit.getSummaryMemoRevision(), visit.getMemoRevision())
                    && command.eventKey().equals("visit:" + visit.getId() + ":summary:" + visit.getMemoRevision())
                    && agreed(request.getGuardianId(), ConsentItem.HEALTH_INFO)
                    && agreed(request.getGuardianId(), ConsentItem.SUMMARY_RECEIVE)
                    && (request.getTargetType() == RequestTargetType.SELF || agreed(request.getGuardianId(), ConsentItem.SUMMARY_SHARE));
        return switch (command.type()) {
            case DEPARTURE, WAITING -> true;
            case ARRIVAL -> visit.getChecklist().stream().anyMatch(item -> item.step() == VisitStep.RECEPTION && item.done());
            case TREATMENT_DONE -> visit.getChecklist().stream().anyMatch(item -> item.step() == VisitStep.TREATMENT && item.done());
            case HOMECOMING -> visit.getEndedAt() != null || visit.getChecklist().stream()
                    .anyMatch(item -> item.step() == VisitStep.SEE_OFF && item.done());
            default -> false;
        };
    }

    private boolean permitsMatching(NotificationCommand command, Request request) {
        if (command.applicationId() == null) return false;
        var application = applications.findById(command.applicationId()).orElse(null);
        if (application == null || !application.getRequestId().equals(request.getId())) return false;
        if (command.visitId() != null) {
            var visit = visits.findById(command.visitId()).orElse(null);
            if (visit == null || !visit.getRequestId().equals(request.getId())
                    || (!command.recipientUserId().equals(request.getGuardianId())
                        && !command.recipientUserId().equals(visit.getVolunteerId()))) return false;
        }
        boolean owner = request.getGuardianId().equals(command.recipientUserId());
        boolean applicant = application.getVolunteerId().equals(command.recipientUserId());
        return switch (command.type()) {
            case APPLICATION_RECEIVED -> owner && request.getStatus() == RequestStatus.RECRUITING
                    && application.getStatus() == ApplicationStatus.PENDING;
            case APPLICATION_ACCEPTED -> applicant && request.getStatus() != RequestStatus.CANCELED
                    && application.getStatus() == ApplicationStatus.ACCEPTED;
            case APPLICATION_CLOSED -> applicant && application.getStatus() == ApplicationStatus.CLOSED
                    && (request.getStatus() == RequestStatus.CONFIRMED || request.getStatus() == RequestStatus.IN_PROGRESS);
            case MATCH_CONFIRMED -> (request.getStatus() == RequestStatus.CONFIRMED || request.getStatus() == RequestStatus.IN_PROGRESS)
                    && application.getStatus() == ApplicationStatus.ACCEPTED
                    && (owner || applications.findAllByRequestIdAndStatus(request.getId(), ApplicationStatus.ACCEPTED)
                        .stream().anyMatch(accepted -> accepted.getVolunteerId().equals(command.recipientUserId())));
            case APPLICATION_CANCELED -> owner && request.getStatus() != RequestStatus.CANCELED
                    && application.getStatus() == ApplicationStatus.CANCELED;
            case REQUEST_CANCELED -> applicant && request.getStatus() == RequestStatus.CANCELED
                    && (application.getStatus() == ApplicationStatus.ACCEPTED || application.getStatus() == ApplicationStatus.CLOSED);
            default -> false;
        };
    }

    private boolean agreed(Long userId, ConsentItem item) {
        return consents.findByUserIdAndItem(userId, item).map(consent -> consent.isAgreed()).orElse(false);
    }
}
