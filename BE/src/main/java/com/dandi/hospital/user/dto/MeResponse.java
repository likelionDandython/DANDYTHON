package com.dandi.hospital.user.dto;

import com.dandi.hospital.global.enums.Role;
import com.dandi.hospital.user.entity.User;

public record MeResponse(Long userId, String email, String name, String phone, Role role, boolean profileCompleted) {
    public static MeResponse from(User u) {
        return new MeResponse(u.getId(), u.getEmail(), u.getName(), u.getPhone(), u.getRole(), u.isProfileCompleted());
    }
}
