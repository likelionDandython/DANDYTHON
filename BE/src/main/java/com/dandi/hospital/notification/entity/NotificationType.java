package com.dandi.hospital.notification.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum NotificationType {
    DEPARTURE("동행 출발", "봉사자를 만나 동행을 시작했어요"),
    ARRIVAL("병원 도착", "병원 접수를 마쳤어요"),
    TREATMENT_DONE("진료 종료", "진료·검사를 마쳤어요"),
    HOMECOMING("귀가 소식", "동행을 마치고 귀가했어요"),
    WAITING("동행 소식", "동행 진행 소식을 확인해주세요"),
    SUMMARY_READY("진료 메모 정리", "진료 메모 정리 결과를 확인해주세요"),
    VISIT_APPROVED("봉사시간 승인", "동행 봉사시간이 승인됐어요"),
    APPLICATION_RECEIVED("새 동행 신청", "동행 요청에 새로운 신청이 도착했어요"),
    APPLICATION_ACCEPTED("동행 신청 수락", "신청한 동행이 수락됐어요"),
    APPLICATION_CLOSED("동행 모집 마감", "다른 봉사자와 매칭되어 동행 모집이 마감됐어요"),
    MATCH_CONFIRMED("동행 확정", "동행 인원이 모여 매칭이 확정됐어요"),
    APPLICATION_CANCELED("동행 신청 취소", "동행 신청이 취소됐어요"),
    REQUEST_CANCELED("동행 요청 취소", "신청한 동행 요청이 취소됐어요");

    private final String title;
    private final String message;
}
