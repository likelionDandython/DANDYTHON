package com.dandi.hospital.volunteer.controller;

import com.dandi.hospital.global.response.ApiResponse;
import com.dandi.hospital.global.security.LoginUser;
import com.dandi.hospital.volunteer.dto.VolunteerProfileRequest;
import com.dandi.hospital.volunteer.dto.VolunteerProfileResponse;
import com.dandi.hospital.volunteer.dto.VolunteerProfileSaveResponse;
import com.dandi.hospital.volunteer.service.VolunteerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** 역할 제한 없음 (보호자/봉사자 모드 전환). 저장은 항상 로그인한 본인 프로필 */
@RestController
@RequestMapping("/api/volunteers")
@RequiredArgsConstructor
public class VolunteerController {

    private final VolunteerService volunteerService;

    @PutMapping("/me")
    public ApiResponse<VolunteerProfileSaveResponse> saveMe(@AuthenticationPrincipal LoginUser user,
                                                            @Valid @RequestBody VolunteerProfileRequest req) {
        return ApiResponse.ok(volunteerService.saveMyProfile(user.id(), req));
    }

    /** 내 프로필 (수정 화면 불러오기용). 아직 없으면 404 VOLUNTEER_NOT_FOUND */
    @GetMapping("/me")
    public ApiResponse<VolunteerProfileResponse> getMe(@AuthenticationPrincipal LoginUser user) {
        return ApiResponse.ok(volunteerService.getProfile(user.id()));
    }

    @GetMapping("/{userId}")
    public ApiResponse<VolunteerProfileResponse> get(@PathVariable Long userId) {
        return ApiResponse.ok(volunteerService.getProfile(userId));
    }
}