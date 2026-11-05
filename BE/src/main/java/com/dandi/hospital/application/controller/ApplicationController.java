package com.dandi.hospital.application.controller;

import com.dandi.hospital.application.dto.ApplyRequestDto;
import com.dandi.hospital.application.dto.ApplyResult;
import com.dandi.hospital.application.service.ApplicationService;
import com.dandi.hospital.global.response.ApiResponse;
import com.dandi.hospital.global.security.LoginUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
}