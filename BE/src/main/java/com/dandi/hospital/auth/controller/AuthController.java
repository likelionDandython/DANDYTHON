package com.dandi.hospital.auth.controller;

import com.dandi.hospital.auth.dto.LoginRequest;
import com.dandi.hospital.auth.dto.LoginResponse;
import com.dandi.hospital.auth.dto.SignupRequest;
import com.dandi.hospital.auth.dto.SignupResponse;
import com.dandi.hospital.auth.service.AuthService;
import com.dandi.hospital.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SignupResponse> signup(@Valid @RequestBody SignupRequest req) {
        return ApiResponse.ok(authService.signup(req));
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.ok(authService.login(req));
    }
}
