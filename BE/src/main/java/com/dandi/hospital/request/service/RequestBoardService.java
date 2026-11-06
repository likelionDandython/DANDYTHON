package com.dandi.hospital.request.service;

import com.dandi.hospital.application.repository.ApplicationRepository;
import com.dandi.hospital.global.enums.ApplicationStatus;
import com.dandi.hospital.global.enums.Need;
import com.dandi.hospital.global.enums.RequestStatus;
import com.dandi.hospital.hospital.service.HospitalService;
import com.dandi.hospital.request.dto.BoardItem;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.repository.RequestRepository;
import com.dandi.hospital.senior.entity.Senior;
import com.dandi.hospital.senior.repository.SeniorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RequestBoardService {

    private static final int EXPECTED_HOURS = 4; // 임시값, 팀 기준 확정 후 변경

    private final RequestRepository requestRepository;
    private final HospitalService hospitalService;
    private final SeniorRepository seniorRepository;
    private final ApplicationRepository applicationRepository;

    public List<BoardItem> getBoard(Long userId, LocalDate date, Long hospitalId, Need need) {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        LocalDate today = now.toLocalDate();

        return requestRepository.findAllByStatusOrderByDateAscMeetTimeAsc(RequestStatus.RECRUITING)
                .stream()
                .filter(r -> !LocalDateTime.of(r.getDate(), r.getMeetTime()).isBefore(now)) // 만남 시각이 지난 요청 제외
                .filter(r -> date == null || r.getDate().equals(date))
                .filter(r -> hospitalId == null || r.getHospitalId().equals(hospitalId))
                .filter(r -> need == null || r.getNeeds().contains(need))
                .map(r -> toItem(r, userId, today))
                .sorted(Comparator.comparing((BoardItem item) -> !item.urgent())) // 급구를 위로
                .toList();
    }

    private BoardItem toItem(Request request, Long userId, LocalDate today) {
        String region = seniorRepository.findById(request.getSeniorId())
                .map(Senior::getRegion)
                .orElse("");
        List<Need> needs = List.copyOf(request.getNeeds());

        return new BoardItem(
                request.getId(),
                request.getDate(),
                request.getMeetTime(),
                hospitalService.getById(request.getHospitalId()).getName(),
                request.getDepartment(),
                request.getMeetPlaceType(),
                region,
                needs,
                EXPECTED_HOURS,
                needs.contains(Need.WALK_ASSIST) || needs.contains(Need.WHEELCHAIR),
                !request.getDate().isAfter(today.plusDays(2)),
                applicationRepository.existsByRequestIdAndVolunteerIdAndStatusNot(
                        request.getId(), userId, ApplicationStatus.CANCELED)
        );
    }
}