package com.dandi.hospital.request.service;

import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.entity.RequestTargetType;
import com.dandi.hospital.senior.entity.Senior;
import com.dandi.hospital.senior.repository.SeniorRepository;
import com.dandi.hospital.user.entity.User;
import com.dandi.hospital.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 동행받는 분 정보를 꺼내 줌
 * - FAMILY: 등록된 어르신 정보
 * - SELF: 요청한 본인 정보 (나이는 없음, 시·군은 만나는 주소 첫 단어)
 */
@Component
@RequiredArgsConstructor
public class RequestTargetResolver {

    private final SeniorRepository seniorRepository;
    private final UserRepository userRepository;

    public record Target(String name, Integer age, String region, String phone) {}

    public Target resolve(Request request) {
        if (request.getTargetType() == RequestTargetType.SELF || request.getSeniorId() == null) {
            User me = userRepository.findById(request.getGuardianId()).orElse(null);
            return new Target(
                    me == null ? "" : me.getName(),
                    null,
                    regionOf(request.getMeetAddress()),
                    me == null ? null : me.getPhone());
        }

        Senior senior = seniorRepository.findById(request.getSeniorId()).orElse(null);
        if (senior == null) return new Target("", null, "", null);
        return new Target(senior.getName(), senior.getAge(), senior.getRegion(), senior.getPhone());
    }

    /** "청송군 청송읍 테스트로 1" → "청송군" */
    static String regionOf(String address) {
        if (address == null || address.isBlank()) return "";
        return address.strip().split("\\s+")[0];
    }
}
