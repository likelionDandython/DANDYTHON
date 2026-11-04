package com.dandi.hospital.volunteer.service;

import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.user.entity.User;
import com.dandi.hospital.user.repository.UserRepository;
import com.dandi.hospital.volunteer.dto.VolunteerProfileRequest;
import com.dandi.hospital.volunteer.dto.VolunteerProfileResponse;
import com.dandi.hospital.volunteer.dto.VolunteerProfileSaveResponse;
import com.dandi.hospital.volunteer.entity.Volunteer;
import com.dandi.hospital.volunteer.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VolunteerService {

    private final VolunteerRepository volunteerRepository;
    private final UserRepository userRepository;

    /** 프로필 생성·수정 (없으면 만들고 있으면 덮어쓰기) */
    @Transactional
    public VolunteerProfileSaveResponse saveMyProfile(Long userId, VolunteerProfileRequest r) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        Volunteer v = volunteerRepository.findByUserId(userId)
                .orElseGet(() -> volunteerRepository.save(Volunteer.create(user)));

        v.update(r.age(), r.gender(), r.school(), r.major(),
                r.grade() == null ? 0 : r.grade(), r.hometown(), r.intro(), r.photoUrl(),
                r.regions(), r.availableDays(), r.transports(), r.abilities());
        user.completeProfile();

        return new VolunteerProfileSaveResponse(userId, true);
    }

    public VolunteerProfileResponse getProfile(Long userId) {
        Volunteer v = volunteerRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.VOLUNTEER_NOT_FOUND));

        // TODO(C): Visit 쪽 집계 메서드 생기면 교체
        //  visitCount   = VisitService.countApprovedByVolunteer(userId)
        //  totalMinutes = VisitService.sumApprovedMinutesByVolunteer(userId)
        //  thanks       = VisitService.getThanksByVolunteer(userId)
        int visitCount = 0;
        int totalMinutes = 0;
        List<VolunteerProfileResponse.ThanksMessage> thanks = List.of();

        return VolunteerProfileResponse.of(v, visitCount, totalMinutes, thanks);
    }

    /** B(신청자 목록)에서 사용 가능: 프로필 엔티티 조회 */
    public Volunteer getByUserId(Long userId) {
        return volunteerRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.VOLUNTEER_NOT_FOUND));
    }
}
