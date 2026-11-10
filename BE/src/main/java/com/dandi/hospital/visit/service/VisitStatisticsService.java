package com.dandi.hospital.visit.service;

import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.visit.dto.VisitStatistics;
import com.dandi.hospital.visit.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VisitStatisticsService {
    private final VisitRepository visitRepository;

    public VisitStatistics getStatistics(Long volunteerId) {
        if (volunteerId == null)
            throw new CustomException(ErrorCode.INVALID_INPUT);
        var totals = visitRepository.summarizeApprovedByVolunteer(volunteerId);
        var thanks = visitRepository.findThanksByVolunteer(volunteerId).stream()
                .filter(message -> !message.message().isBlank()).toList();
        return new VisitStatistics(totals.getVisitCount(), totals.getTotalMinutes(), thanks);
    }
}
