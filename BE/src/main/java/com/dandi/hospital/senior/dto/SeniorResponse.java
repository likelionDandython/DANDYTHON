package com.dandi.hospital.senior.dto;

import com.dandi.hospital.senior.entity.Senior;

public record SeniorResponse(Long seniorId, String name, int age, String phone, String region) {
    public static SeniorResponse from(Senior s) {
        return new SeniorResponse(s.getId(), s.getName(), s.getAge(), s.getPhone(), s.getRegion());
    }
}
