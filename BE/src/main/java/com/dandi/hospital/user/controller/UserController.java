package com.dandi.hospital.user.controller;

import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.global.response.ApiResponse;
import com.dandi.hospital.global.security.LoginUser;
import com.dandi.hospital.user.dto.MeResponse;
import com.dandi.hospital.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /** 토큰 테스트용: 로그인한 내 정보 */
    @GetMapping("/me")
    public ApiResponse<MeResponse> me(@AuthenticationPrincipal LoginUser loginUser) {
        return ApiResponse.ok(userRepository.findById(loginUser.id())
                .map(MeResponse::from)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND)));
    }
}
