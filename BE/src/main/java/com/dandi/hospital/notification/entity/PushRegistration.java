package com.dandi.hospital.notification.entity;

import com.dandi.hospital.global.entity.BaseEntity;
import com.dandi.hospital.notification.dto.PushTarget;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Objects;

@Entity
@Table(name = "push_registrations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_push_registration_device", columnNames = "device_id"),
        @UniqueConstraint(name = "uk_push_registration_target", columnNames = "target_hash")
}, indexes = @Index(name = "idx_push_registration_user_active", columnList = "user_id,active"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PushRegistration extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "device_id", nullable = false, length = 36, updatable = false)
    private String deviceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PushTarget.Type registrationType;

    @Column(nullable = false, length = 4096)
    private String registrationValue;

    @Column(name = "target_hash", nullable = false, length = 64)
    private String targetHash;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private long generation;

    @Column(nullable = false)
    private LocalDateTime refreshedAt;

    public static PushRegistration create(Long userId, String deviceId, PushTarget target, LocalDateTime now) {
        PushRegistration registration = new PushRegistration();
        registration.deviceId = Objects.requireNonNull(deviceId);
        registration.refresh(userId, target, now);
        return registration;
    }

    public void refresh(Long userId, PushTarget target, LocalDateTime now) {
        this.userId = Objects.requireNonNull(userId);
        this.registrationType = target.type();
        this.registrationValue = target.value();
        this.targetHash = hash(target);
        this.active = true;
        this.generation++;
        this.refreshedAt = Objects.requireNonNull(now);
    }

    public boolean hasTarget(PushTarget target) {
        return registrationType == target.type() && registrationValue.equals(target.value());
    }

    public void deactivate() {
        this.active = false;
        this.generation++;
    }

    public static String hash(PushTarget target) {
        try {
            byte[] value = (target.type().name() + ":" + target.value()).getBytes(StandardCharsets.UTF_8);
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable");
        }
    }
}
