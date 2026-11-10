package com.dandi.hospital.visit.entity;

import java.util.List;

public record SummaryContent(List<String> todayPoints, String nextVisit, String medication,
                             List<String> guardianTodo, String disclaimer) {
    public static final String DISCLAIMER = "봉사자 메모를 정리한 내용이며, 정확한 내용은 병원에 확인하시기 바랍니다";

    public SummaryContent {
        todayPoints = List.copyOf(todayPoints);
        guardianTodo = List.copyOf(guardianTodo);
    }
}
