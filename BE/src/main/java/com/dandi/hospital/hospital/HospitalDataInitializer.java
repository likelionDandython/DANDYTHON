package com.dandi.hospital.hospital;

import com.dandi.hospital.hospital.entity.Hospital;
import com.dandi.hospital.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/** 서버 시작 시 병원 테이블이 비어 있으면 5곳 자동 등록 */
@Component
@RequiredArgsConstructor
public class HospitalDataInitializer implements CommandLineRunner {

    private final HospitalRepository hospitalRepository;

    @Override
    public void run(String... args) {
        if (hospitalRepository.count() > 0) return;
        hospitalRepository.saveAll(List.of(
                new Hospital("경북대학교병원", "대구 중구 동덕로 130"),
                new Hospital("칠곡경북대학교병원", "대구 북구 호국로 807"),
                new Hospital("계명대학교 동산병원", "대구 달서구 달구벌대로 1035"),
                new Hospital("영남대학교병원", "대구 남구 현충로 170"),
                new Hospital("대구가톨릭대학교병원", "대구 남구 두류공원로17길 33")
        ));
    }
}
