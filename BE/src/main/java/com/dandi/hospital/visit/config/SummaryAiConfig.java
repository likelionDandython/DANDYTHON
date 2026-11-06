package com.dandi.hospital.visit.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.concurrent.*;

@Configuration
@EnableConfigurationProperties(GeminiProperties.class)
public class SummaryAiConfig {
    @Bean(name = "summaryHttpExecutor", destroyMethod = "shutdownNow")
    public ExecutorService summaryHttpExecutor() {
        return new ThreadPoolExecutor(4, 4, 0, TimeUnit.SECONDS, new ArrayBlockingQueue<>(32), task -> {
            Thread thread = new Thread(task, "summary-http");
            thread.setDaemon(true);
            return thread;
        }, new ThreadPoolExecutor.AbortPolicy());
    }

    @Bean
    public HttpClient summaryHttpClient(@Qualifier("summaryHttpExecutor") ExecutorService executor) {
        return HttpClient.newBuilder().executor(executor).connectTimeout(Duration.ofSeconds(3))
                .followRedirects(HttpClient.Redirect.NEVER).build();
    }
}
