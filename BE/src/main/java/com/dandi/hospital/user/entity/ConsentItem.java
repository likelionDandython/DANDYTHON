package com.dandi.hospital.user.entity;

import com.dandi.hospital.global.enums.Role;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 동의 항목. (보호자 필수, 봉사자 필수)
 * 필수 여부가 기능명세서랑 다르면 여기 true/false만 바꾸면 됨
 */
@Getter
@RequiredArgsConstructor
public enum ConsentItem {
    // 공통 필수
    TERMS(true, true),            // 이용약관
    PRIVACY(true, true),          // 개인정보 수집·이용
    THIRD_PARTY(true, true),      // 개인정보 제3자 제공 (매칭 상대에게 연락처 공개)

    // 보호자
    PROXY_CONFIRM(false, false),  // 어르신 대리 신청 확인
    SUMMARY_RECEIVE(false, false),// 진료 요약 수신
    HEALTH_INFO(true, false),     // 건강정보 수집 (보호자 필수)
    SUMMARY_SHARE(false, false),  // 요약 공유 (선택)

    // 봉사자
    PROFILE_PUBLIC(false, true),  // 프로필 공개
    VOLUNTEER_PLEDGE(false, true),// 봉사 서약 (역할 제한)
    CONFIDENTIALITY(false, true), // 비밀유지
    SCHOOL_VERIFY(false, false);  // 재학 인증 (선택)

    private final boolean requiredForGuardian;
    private final boolean requiredForVolunteer;

    public boolean isRequiredFor(Role role) {
        return role == Role.GUARDIAN ? requiredForGuardian : requiredForVolunteer;
    }
}
