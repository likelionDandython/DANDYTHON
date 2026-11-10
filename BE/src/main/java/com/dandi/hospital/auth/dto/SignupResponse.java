package com.dandi.hospital.auth.dto;

import com.dandi.hospital.global.enums.Role;

public record SignupResponse(Long userId, Role role) {}
