package com.dandi.hospital.notification.entity;

import com.dandi.hospital.notification.client.PushClientException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "push_deliveries", uniqueConstraints = @UniqueConstraint(name = "uk_push_delivery_notification_device",
        columnNames = {"notification_id", "registration_id"}),
        indexes = @Index(name = "idx_push_delivery_due", columnList = "status,next_attempt_at,id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PushDelivery {
    public enum Status { PENDING, RETRY, ACCEPTED, DISABLED, INVALID, FAILED, SKIPPED }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "notification_id", nullable = false) private Long notificationId;
    @Column(name = "registration_id", nullable = false) private Long registrationId;
    @Column(nullable = false) private long registrationGeneration;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status;
    @Column(nullable = false) private int attempts;
    @Column(name = "next_attempt_at", nullable = false) private LocalDateTime nextAttemptAt;
    @Enumerated(EnumType.STRING) @Column(length = 40) private PushClientException.Reason failureReason;
    private LocalDateTime finishedAt;

    public static PushDelivery create(Long notificationId, PushRegistration registration, LocalDateTime now) {
        PushDelivery delivery = new PushDelivery();
        delivery.notificationId = notificationId;
        delivery.registrationId = registration.getId();
        delivery.registrationGeneration = registration.getGeneration();
        delivery.status = Status.PENDING;
        delivery.nextAttemptAt = now;
        return delivery;
    }

    public boolean isDue(LocalDateTime now) {
        return (status == Status.PENDING || status == Status.RETRY) && !nextAttemptAt.isAfter(now);
    }

    public void startAttempt() { attempts++; }

    public void finish(Status status, LocalDateTime now, PushClientException.Reason reason) {
        this.status = status;
        this.finishedAt = now;
        this.failureReason = reason;
    }

    public void retry(LocalDateTime time, PushClientException.Reason reason) {
        this.status = Status.RETRY;
        this.nextAttemptAt = time;
        this.failureReason = reason;
    }
}
