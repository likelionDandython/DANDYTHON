package com.dandi.hospital.notification.controller;

import com.dandi.hospital.global.response.ApiResponse;
import com.dandi.hospital.global.security.LoginUser;
import com.dandi.hospital.notification.dto.*;
import com.dandi.hospital.notification.service.NotificationInboxService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationInboxService inbox;

    @GetMapping
    public ApiResponse<NotificationList> list(@AuthenticationPrincipal LoginUser user,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.ok(inbox.list(id(user), page, size));
    }

    @PatchMapping("/{notificationId}/read")
    public ApiResponse<Void> read(@AuthenticationPrincipal LoginUser user, @PathVariable Long notificationId) {
        inbox.read(id(user), notificationId);
        return ApiResponse.ok();
    }

    @PatchMapping("/read-all")
    public ApiResponse<Void> readAll(@AuthenticationPrincipal LoginUser user) {
        inbox.readAll(id(user));
        return ApiResponse.ok();
    }

    @GetMapping("/settings")
    public ApiResponse<NotificationSettingsDto> settings(@AuthenticationPrincipal LoginUser user) {
        return ApiResponse.ok(inbox.settings(id(user)));
    }

    @PutMapping("/settings")
    public ApiResponse<NotificationSettingsDto> updateSettings(@AuthenticationPrincipal LoginUser user,
            @Valid @RequestBody NotificationSettingsDto update) {
        return ApiResponse.ok(inbox.updateSettings(id(user), update));
    }

    private Long id(LoginUser user) { return user == null ? null : user.id(); }
}
