package com.dandi.hospital.hospital.dto;

import com.dandi.hospital.hospital.entity.Hospital;

public record HospitalResponse(Long hospitalId, String name, String address) {
    public static HospitalResponse from(Hospital h) {
        return new HospitalResponse(h.getId(), h.getName(), h.getAddress());
    }
}
