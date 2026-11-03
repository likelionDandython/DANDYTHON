package com.dandi.hospital.auth.dto;

import com.dandi.hospital.global.enums.Role;

public record LoginResponse(String accessToken, Long userId, Role role, String name, boolean profileCompleted) {}
