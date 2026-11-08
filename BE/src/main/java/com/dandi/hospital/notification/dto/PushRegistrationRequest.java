package com.dandi.hospital.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PushRegistrationRequest(
        @NotNull PushTarget.Type registrationType,
        @NotBlank @Size(max = 4096) @Pattern(regexp = "\\S+", message = "공백을 포함할 수 없습니다")
        String registrationValue) {

    @Override
    public String toString() {
        return "PushRegistrationRequest[registrationType=" + registrationType + ", registrationValue=[REDACTED]]";
    }
}
