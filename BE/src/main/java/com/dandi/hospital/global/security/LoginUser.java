package com.dandi.hospital.global.security;

import com.dandi.hospital.global.enums.Role;

/**
 * 컨트롤러에서 로그인 유저 꺼내는 법:
 *   public ApiResponse<?> foo(@AuthenticationPrincipal LoginUser user) { user.id(); user.role(); }
 */
public record LoginUser(Long id, Role role) {
    public boolean isGuardian()  { return role == Role.GUARDIAN; }
    public boolean isVolunteer() { return role == Role.VOLUNTEER; }
}
