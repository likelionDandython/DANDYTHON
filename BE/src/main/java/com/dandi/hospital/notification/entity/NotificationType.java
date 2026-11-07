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
    VISIT_APPROVED("봉사시간 승인", "동행 봉사시간이 승인됐어요");

    private final String title;
    private final String message;
}
