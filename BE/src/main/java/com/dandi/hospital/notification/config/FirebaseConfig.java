package com.dandi.hospital.notification.config;

import com.dandi.hospital.notification.client.DisabledPushClient;
import com.dandi.hospital.notification.client.FcmPushClient;
import com.dandi.hospital.notification.client.PushClient;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.util.UUID;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(FirebaseProperties.class)
public class FirebaseConfig {
    @Bean(name = "notificationFirebaseApp", destroyMethod = "delete")
    @ConditionalOnProperty(prefix = "notification.firebase", name = "enabled", havingValue = "true")
    public FirebaseApp notificationFirebaseApp(FirebaseProperties properties) {
        GoogleCredentials credentials;
        try {
            credentials = GoogleCredentials.getApplicationDefault();
        } catch (IOException e) {
            throw new IllegalStateException("Firebase credentials are unavailable. Configure Application Default Credentials.");
        }
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .setProjectId(properties.getProjectId().strip())
                .setConnectTimeout(Math.toIntExact(properties.getConnectTimeout().toMillis()))
                .setReadTimeout(Math.toIntExact(properties.getReadTimeout().toMillis()))
                .setWriteTimeout(Math.toIntExact(properties.getWriteTimeout().toMillis()))
                .build();
        return FirebaseApp.initializeApp(options, "hospital-notification-" + UUID.randomUUID());
    }

    @Bean(name = "notificationFirebaseMessaging")
    @ConditionalOnProperty(prefix = "notification.firebase", name = "enabled", havingValue = "true")
    public FirebaseMessaging notificationFirebaseMessaging(
            @Qualifier("notificationFirebaseApp") FirebaseApp app) {
        return FirebaseMessaging.getInstance(app);
    }

    @Bean
    @ConditionalOnMissingBean(PushClient.class)
    @ConditionalOnProperty(prefix = "notification.firebase", name = "enabled", havingValue = "true")
    public PushClient fcmPushClient(
            @Qualifier("notificationFirebaseMessaging") FirebaseMessaging messaging) {
        return new FcmPushClient(messaging);
    }

    @Bean
    @ConditionalOnMissingBean(PushClient.class)
    @ConditionalOnProperty(prefix = "notification.firebase", name = "enabled", havingValue = "false", matchIfMissing = true)
    public PushClient disabledPushClient() {
        return new DisabledPushClient();
    }
}
