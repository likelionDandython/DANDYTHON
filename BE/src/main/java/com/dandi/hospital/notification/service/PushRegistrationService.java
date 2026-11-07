package com.dandi.hospital.notification.service;

import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.notification.dto.PushRegistrationRequest;
import com.dandi.hospital.notification.dto.PushRegistrationResponse;
import com.dandi.hospital.notification.dto.PushTarget;
import com.dandi.hospital.notification.entity.PushRegistration;
import com.dandi.hospital.notification.repository.PushRegistrationRepository;
import com.dandi.hospital.user.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
public class PushRegistrationService {
    private static final int MAX_ATTEMPTS = 3;
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private final PushRegistrationRepository registrations;
    private final UserRepository users;
    private final Clock clock;
    private final TransactionTemplate transactions;

    public PushRegistrationService(PushRegistrationRepository registrations, UserRepository users,
                                   Clock clock, PlatformTransactionManager transactionManager) {
        this.registrations = registrations;
        this.users = users;
        this.clock = clock;
        this.transactions = new TransactionTemplate(transactionManager);
        // A failed insert must roll back before a concurrent registration is read again.
        this.transactions.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        this.transactions.setIsolationLevel(TransactionDefinition.ISOLATION_READ_COMMITTED);
    }

    public PushRegistrationResponse register(Long userId, UUID deviceId, PushRegistrationRequest request) {
        if (userId == null) throw new CustomException(ErrorCode.UNAUTHORIZED);
        if (deviceId == null || request == null || request.registrationType() == null
                || request.registrationValue() == null || request.registrationValue().isBlank()
                || request.registrationValue().length() > 4096
                || !request.registrationValue().matches("\\S+"))
            throw new CustomException(ErrorCode.INVALID_INPUT);

        PushTarget target = new PushTarget(request.registrationType(), request.registrationValue());
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            try {
                return transactions.execute(status -> registerInTransaction(userId, deviceId.toString(), target));
            } catch (DataIntegrityViolationException | PessimisticLockingFailureException e) {
                if (attempt == MAX_ATTEMPTS - 1)
                    throw new CustomException(ErrorCode.PUSH_REGISTRATION_CONFLICT);
            }
        }
        throw new CustomException(ErrorCode.PUSH_REGISTRATION_CONFLICT);
    }

    public void unregister(Long userId, UUID deviceId) {
        if (userId == null) throw new CustomException(ErrorCode.UNAUTHORIZED);
        if (deviceId == null) throw new CustomException(ErrorCode.INVALID_INPUT);
        transactions.executeWithoutResult(status -> {
            if (!users.existsById(userId)) throw new CustomException(ErrorCode.USER_NOT_FOUND);
            registrations.findByDeviceIdForUpdate(deviceId.toString()).ifPresent(registration -> {
                if (!registration.getUserId().equals(userId)) throw new CustomException(ErrorCode.FORBIDDEN);
                registration.deactivate();
            });
        });
    }

    private PushRegistrationResponse registerInTransaction(Long userId, String deviceId, PushTarget target) {
        if (!users.existsById(userId)) throw new CustomException(ErrorCode.USER_NOT_FOUND);

        PushRegistration registration = registrations.findByDeviceIdForUpdate(deviceId).orElse(null);
        if (registration != null && !registration.getUserId().equals(userId) && !registration.hasTarget(target))
            throw new CustomException(ErrorCode.FORBIDDEN);

        // A target cannot be reused under another device ID, even for the same account.
        registrations.findByTargetHash(PushRegistration.hash(target)).ifPresent(existing -> {
            if (!existing.getDeviceId().equals(deviceId))
                throw new CustomException(ErrorCode.PUSH_REGISTRATION_CONFLICT);
        });

        LocalDateTime now = LocalDateTime.now(clock.withZone(KST));
        if (registration == null)
            registration = PushRegistration.create(userId, deviceId, target, now);
        else
            registration.refresh(userId, target, now);
        return PushRegistrationResponse.from(registrations.saveAndFlush(registration));
    }
}
