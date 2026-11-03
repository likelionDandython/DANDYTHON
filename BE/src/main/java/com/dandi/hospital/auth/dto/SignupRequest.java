package com.dandi.hospital.auth.dto;

import com.dandi.hospital.global.enums.Role;
import com.dandi.hospital.user.entity.ConsentItem;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record SignupRequest(
        @NotNull Role role,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 20, message = "비밀번호는 8~20자입니다") String password,
        @NotBlank @Size(max = 30) String name,
        @NotBlank @Pattern(regexp = "^010-?\\d{4}-?\\d{4}$", message = "전화번호 형식이 올바르지 않습니다") String phone,
        @NotNull List<@Valid ConsentDto> consents
) {
    public record ConsentDto(@NotNull ConsentItem item, boolean agreed) {}
}
