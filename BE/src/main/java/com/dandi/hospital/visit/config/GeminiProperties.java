package com.dandi.hospital.visit.config;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.net.URI;
import java.time.Duration;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "llm.gemini")
public class GeminiProperties {
    private String apiKey = "";
    @NotBlank @Pattern(regexp = "[a-zA-Z0-9.-]+")
    private String model = "gemini-3.1-flash-lite";
    @NotNull
    private URI baseUrl = URI.create("https://generativelanguage.googleapis.com");
    @NotNull
    private Duration timeout = Duration.ofSeconds(10);
    @Min(1) @Max(16)
    private int maxConcurrentRequests = 4;
    @Min(1) @Max(5000)
    private int minMemoLength = 20;

    @AssertTrue(message = "Gemini timeout must be greater than zero and at most 10 seconds")
    public boolean isTimeoutValid() {
        return timeout != null && !timeout.isNegative() && !timeout.isZero()
                && timeout.compareTo(Duration.ofSeconds(10)) <= 0;
    }

    @AssertTrue(message = "Gemini endpoint must use HTTPS, or HTTP on loopback for local tests")
    public boolean isEndpointValid() {
        return baseUrl != null && baseUrl.getHost() != null && baseUrl.getUserInfo() == null
                && baseUrl.getQuery() == null && baseUrl.getFragment() == null
                && ("https".equals(baseUrl.getScheme()) || ("http".equals(baseUrl.getScheme())
                && ("127.0.0.1".equals(baseUrl.getHost()) || "localhost".equals(baseUrl.getHost()))));
    }
}
