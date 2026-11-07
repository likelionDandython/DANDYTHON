package com.dandi.hospital.notification.entity;

import com.dandi.hospital.notification.dto.NotificationSettingsDto;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notification_settings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationSettings {
    @Id private Long userId;
    @Column(nullable = false) private boolean departure;
    @Column(nullable = false) private boolean arrival;
    @Column(nullable = false) private boolean treatmentDone;
    @Column(nullable = false) private boolean homecoming;
    @Column(nullable = false) private boolean waiting;

    public static NotificationSettings create(Long userId, NotificationSettingsDto dto) {
        NotificationSettings settings = new NotificationSettings();
        settings.userId = userId;
        settings.update(dto);
        return settings;
    }

    public void update(NotificationSettingsDto dto) {
        departure = dto.departure();
        arrival = dto.arrival();
        treatmentDone = dto.treatmentDone();
        homecoming = dto.homecoming();
        waiting = dto.waiting();
    }

    public NotificationSettingsDto toDto() {
        return new NotificationSettingsDto(departure, arrival, treatmentDone, homecoming, waiting);
    }
}
