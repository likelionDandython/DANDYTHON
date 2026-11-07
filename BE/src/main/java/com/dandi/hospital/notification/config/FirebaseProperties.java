package com.dandi.hospital.notification.config;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "notification.firebase")
public class FirebaseProperties {
    private boolean enabled;
    private String projectId = "";
    @NotNull
    private Duration connectTimeout = Duration.ofSeconds(3);
    @NotNull
    private Duration readTimeout = Duration.ofSeconds(5);
    @NotNull
    private Duration writeTimeout = Duration.ofSeconds(5);

    @AssertTrue(message = "Firebase project-id is required when FCM is enabled")
    public boolean isProjectConfigured() {
        return !enabled || (projectId != null && !projectId.isBlank());
    }

    @AssertTrue(message = "Firebase timeouts must be between 1ms and 30s")
    public boolean isTimeoutConfigurationValid() {
        return validTimeout(connectTimeout) && validTimeout(readTimeout) && validTimeout(writeTimeout);
    }

    private boolean validTimeout(Duration timeout) {
        return timeout != null && timeout.compareTo(Duration.ofMillis(1)) >= 0
                && timeout.compareTo(Duration.ofSeconds(30)) <= 0;
    }
}
