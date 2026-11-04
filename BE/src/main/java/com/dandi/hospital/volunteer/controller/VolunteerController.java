package com.dandi.hospital.volunteer.controller;

import com.dandi.hospital.global.response.ApiResponse;
import com.dandi.hospital.global.security.LoginUser;
import com.dandi.hospital.volunteer.dto.VolunteerProfileRequest;
import com.dandi.hospital.volunteer.dto.VolunteerProfileResponse;
import com.dandi.hospital.volunteer.dto.VolunteerProfileSaveResponse;
import com.dandi.hospital.volunteer.service.VolunteerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/volunteers")
@RequiredArgsConstructor
public class VolunteerController {

    private final VolunteerService volunteerService;

    @PutMapping("/me")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ApiResponse<VolunteerProfileSaveResponse> saveMe(@AuthenticationPrincipal LoginUser user,
                                                            @Valid @RequestBody VolunteerProfileRequest req) {
        return ApiResponse.ok(volunteerService.saveMyProfile(user.id(), req));
    }

    /** 내 프로필 (수정 화면 불러오기용) */
    @GetMapping("/me")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ApiResponse<VolunteerProfileResponse> getMe(@AuthenticationPrincipal LoginUser user) {
        return ApiResponse.ok(volunteerService.getProfile(user.id()));
    }

    @GetMapping("/{userId}")
    public ApiResponse<VolunteerProfileResponse> get(@PathVariable Long userId) {
        return ApiResponse.ok(volunteerService.getProfile(userId));
    }
}
