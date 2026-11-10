package com.dandi.hospital.notification.dto;

import com.dandi.hospital.notification.entity.NotificationType;
import jakarta.validation.constraints.NotNull;

public record NotificationSettingsDto(@NotNull Boolean departure, @NotNull Boolean arrival,
                                      @NotNull Boolean treatmentDone, @NotNull Boolean homecoming,
                                      @NotNull Boolean waiting) {
    public static NotificationSettingsDto defaults() {
        return new NotificationSettingsDto(true, true, true, true, true);
    }

    public boolean allows(NotificationType type) {
        return switch (type) {
            case DEPARTURE -> Boolean.TRUE.equals(departure);
            case ARRIVAL -> Boolean.TRUE.equals(arrival);
            case TREATMENT_DONE -> Boolean.TRUE.equals(treatmentDone);
            case HOMECOMING -> Boolean.TRUE.equals(homecoming);
            case WAITING -> Boolean.TRUE.equals(waiting);
            default -> true;
        };
    }
}
