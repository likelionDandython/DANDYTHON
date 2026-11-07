package com.dandi.hospital.notification.dto;

import com.dandi.hospital.notification.entity.PushRegistration;

import java.time.LocalDateTime;
import java.util.UUID;

public record PushRegistrationResponse(Long id, UUID deviceId, PushTarget.Type registrationType,
                                       boolean active, LocalDateTime refreshedAt) {
    public static PushRegistrationResponse from(PushRegistration registration) {
        return new PushRegistrationResponse(registration.getId(), UUID.fromString(registration.getDeviceId()),
                registration.getRegistrationType(), registration.isActive(), registration.getRefreshedAt());
    }
}
