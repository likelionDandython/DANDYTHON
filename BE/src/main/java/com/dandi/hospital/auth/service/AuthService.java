package com.dandi.hospital.auth.service;

import com.dandi.hospital.auth.dto.LoginRequest;
import com.dandi.hospital.auth.dto.LoginResponse;
import com.dandi.hospital.auth.dto.SignupRequest;
import com.dandi.hospital.auth.dto.SignupResponse;
import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.global.security.JwtProvider;
import com.dandi.hospital.user.entity.Consent;
import com.dandi.hospital.user.entity.ConsentItem;
import com.dandi.hospital.user.entity.User;
import com.dandi.hospital.user.repository.ConsentRepository;
import com.dandi.hospital.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.EnumMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ConsentRepository consentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Transactional
    public SignupResponse signup(SignupRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new CustomException(ErrorCode.EMAIL_DUPLICATED);
        }

        // 같은 항목이 두 번 오면 마지막 값 사용
        Map<ConsentItem, Boolean> agreed = new EnumMap<>(ConsentItem.class);
        req.consents().forEach(c -> agreed.put(c.item(), c.agreed()));

        boolean missingRequired = Arrays.stream(ConsentItem.values())
                .filter(item -> item.isRequiredFor(req.role()))
                .anyMatch(item -> !agreed.getOrDefault(item, false));
        if (missingRequired) {
            throw new CustomException(ErrorCode.REQUIRED_CONSENT_MISSING);
        }

        User user = userRepository.save(User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .name(req.name())
                .phone(req.phone())
                .role(req.role())
                .build());

        agreed.forEach((item, value) -> consentRepository.save(Consent.of(user, item, value)));

        return new SignupResponse(user.getId(), user.getRole());
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new CustomException(ErrorCode.LOGIN_FAILED));
        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new CustomException(ErrorCode.LOGIN_FAILED);
        }
        String token = jwtProvider.createToken(user.getId(), user.getRole());
        return new LoginResponse(token, user.getId(), user.getRole(), user.getName(), user.isProfileCompleted());
    }
}
