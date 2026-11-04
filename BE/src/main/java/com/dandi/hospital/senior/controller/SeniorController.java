package com.dandi.hospital.senior.controller;

import com.dandi.hospital.global.response.ApiResponse;
import com.dandi.hospital.global.security.LoginUser;
import com.dandi.hospital.senior.dto.SeniorCreateRequest;
import com.dandi.hospital.senior.dto.SeniorCreateResponse;
import com.dandi.hospital.senior.dto.SeniorResponse;
import com.dandi.hospital.senior.service.SeniorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seniors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GUARDIAN')")
public class SeniorController {

    private final SeniorService seniorService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SeniorCreateResponse> create(@AuthenticationPrincipal LoginUser user,
                                                    @Valid @RequestBody SeniorCreateRequest req) {
        return ApiResponse.ok(seniorService.create(user.id(), req));
    }

    @GetMapping("/me")
    public ApiResponse<List<SeniorResponse>> getMine(@AuthenticationPrincipal LoginUser user) {
        return ApiResponse.ok(seniorService.getMySeniors(user.id()));
    }
}
