package com.dandi.hospital.application.controller;

import com.dandi.hospital.application.dto.ApplyRequestDto;
import com.dandi.hospital.application.dto.AcceptResult;
import com.dandi.hospital.application.dto.ApplicationItem;
import com.dandi.hospital.application.dto.ApplyResult;
import com.dandi.hospital.application.service.ApplicationService;
import com.dandi.hospital.global.response.ApiResponse;
import com.dandi.hospital.global.security.LoginUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/requests/{requestId}/applications")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ApplyResult> apply(
            @AuthenticationPrincipal LoginUser user,
            @PathVariable Long requestId,
            @Valid @RequestBody ApplyRequestDto dto) {
        return ApiResponse.ok(applicationService.apply(user.id(), requestId, dto));
    }

    @GetMapping("/requests/{requestId}/applications")
    public ApiResponse<List<ApplicationItem>> applicants(
            @AuthenticationPrincipal LoginUser user,
            @PathVariable Long requestId) {
        return ApiResponse.ok(applicationService.getApplicants(user.id(), requestId));
    }

    @PostMapping("/applications/{applicationId}/accept")
    public ApiResponse<AcceptResult> accept(
            @AuthenticationPrincipal LoginUser user,
            @PathVariable Long applicationId) {
        return ApiResponse.ok(applicationService.accept(user.id(), applicationId));
    }
}
