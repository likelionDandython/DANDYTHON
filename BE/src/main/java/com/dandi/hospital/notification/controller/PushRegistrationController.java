package com.dandi.hospital.notification.controller;

import com.dandi.hospital.global.response.ApiResponse;
import com.dandi.hospital.global.security.LoginUser;
import com.dandi.hospital.notification.dto.PushRegistrationRequest;
import com.dandi.hospital.notification.dto.PushRegistrationResponse;
import com.dandi.hospital.notification.service.PushRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users/me/push-registrations")
@RequiredArgsConstructor
public class PushRegistrationController {
    private final PushRegistrationService registrationService;

    @DeleteMapping("/{deviceId}")
    public ApiResponse<Void> unregister(@PathVariable UUID deviceId, @AuthenticationPrincipal LoginUser user) {
        registrationService.unregister(user == null ? null : user.id(), deviceId);
        return ApiResponse.ok();
    }

    @PutMapping("/{deviceId}")
    public ApiResponse<PushRegistrationResponse> register(
            @PathVariable UUID deviceId, @AuthenticationPrincipal LoginUser user,
            @Valid @RequestBody PushRegistrationRequest request) {
        return ApiResponse.ok(registrationService.register(user == null ? null : user.id(), deviceId, request));
    }
}
