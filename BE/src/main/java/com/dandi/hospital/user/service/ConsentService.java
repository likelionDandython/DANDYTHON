package com.dandi.hospital.user.service;

import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.user.entity.Consent;
import com.dandi.hospital.user.entity.ConsentItem;
import com.dandi.hospital.user.repository.ConsentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConsentService {
    private final ConsentRepository consentRepository;

    public void requireHealthInfoConsent(Long requesterId) {
        boolean agreed = consentRepository.findByUserIdAndItem(requesterId, ConsentItem.HEALTH_INFO)
                .map(Consent::isAgreed).orElse(false);
        if (!agreed)
            throw new CustomException(ErrorCode.CONSENT_REQUIRED);
    }
}
