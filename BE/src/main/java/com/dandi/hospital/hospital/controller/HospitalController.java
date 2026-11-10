package com.dandi.hospital.hospital.controller;

import com.dandi.hospital.global.response.ApiResponse;
import com.dandi.hospital.hospital.dto.HospitalResponse;
import com.dandi.hospital.hospital.service.HospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    @GetMapping
    public ApiResponse<List<HospitalResponse>> getAll() {
        return ApiResponse.ok(hospitalService.getAll());
    }
}
