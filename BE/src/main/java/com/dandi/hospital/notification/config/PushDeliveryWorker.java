package com.dandi.hospital.notification.config;

import com.dandi.hospital.notification.entity.PushDelivery;
import com.dandi.hospital.notification.repository.PushDeliveryRepository;
import com.dandi.hospital.notification.service.PushDeliveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.Component;

import java.time.*;
import java.util.List;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "notification.delivery", name = "enabled", havingValue = "true", matchIfMissing = true)
public class PushDeliveryWorker {
    private final PushDeliveryRepository deliveries;
    private final PushDeliveryService service;
    private final Clock clock;

    @Scheduled(fixedDelayString = "${notification.delivery.poll-delay-ms:1000}")
    public void runDue() {
        try {
            var due = deliveries.findDue(List.of(PushDelivery.Status.PENDING, PushDelivery.Status.RETRY),
                    LocalDateTime.now(clock.withZone(ZoneId.of("Asia/Seoul"))), PageRequest.of(0, 25));
            for (Long id : due) {
                try { service.deliver(id); }
                catch (RuntimeException e) { log.warn("Push worker could not process deliveryId={}", id); }
            }
        } catch (RuntimeException e) {
            log.warn("Push worker could not load pending deliveries");
        }
    }
}
