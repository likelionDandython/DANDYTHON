package com.dandi.hospital.user.entity;

import com.dandi.hospital.global.enums.Role;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 동의 항목. (보호자 필수, 봉사자 필수)
 * FE 가입 화면 기준으로 맞춤 (11/4)
 */
@Getter
@RequiredArgsConstructor
public enum ConsentItem {
    // 공통 필수
    TERMS(true, true),
    PRIVACY(true, true),
    THIRD_PARTY(true, true),

    // 보호자
    PROXY_CONFIRM(true, false),   // 어르신 대리 신청 확인 (필수)
    HEALTH_INFO(true, false),     // 건강정보 수집 (필수)
    SUMMARY_SHARE(false, false),  // 선택
    SUMMARY_RECEIVE(false, false),// 선택

    // 봉사자
    PROFILE_PUBLIC(false, true),
    VOLUNTEER_PLEDGE(false, true),
    CONFIDENTIALITY(false, true),
    SCHOOL_VERIFY(false, false);  // 선택

    private final boolean requiredForGuardian;
    private final boolean requiredForVolunteer;

    public boolean isRequiredFor(Role role) {
        return role == Role.GUARDIAN ? requiredForGuardian : requiredForVolunteer;
    }
}
