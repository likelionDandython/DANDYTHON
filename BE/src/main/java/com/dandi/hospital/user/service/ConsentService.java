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
        if (!isAgreed(requesterId, ConsentItem.HEALTH_INFO))
            throw new CustomException(ErrorCode.CONSENT_REQUIRED);
    }

    public void requireSummaryReceiveConsent(Long requesterId) {
        if (!isAgreed(requesterId, ConsentItem.SUMMARY_RECEIVE))
            throw new CustomException(ErrorCode.SUMMARY_CONSENT_REQUIRED);
    }

    public void requireSummaryShareConsent(Long requesterId) {
        if (!isAgreed(requesterId, ConsentItem.SUMMARY_SHARE))
            throw new CustomException(ErrorCode.SUMMARY_CONSENT_REQUIRED);
    }

    private boolean isAgreed(Long userId, ConsentItem item) {
        return consentRepository.findByUserIdAndItem(userId, item).map(Consent::isAgreed).orElse(false);
    }
}
