package com.dandi.hospital.request.entity;

import com.dandi.hospital.global.entity.BaseEntity;
import com.dandi.hospital.global.enums.GenderPref;
import com.dandi.hospital.global.enums.MeetPlaceType;
import com.dandi.hospital.global.enums.Need;
import com.dandi.hospital.global.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/** 보호자가 올리는 동행 요청 */
@Entity
@Table(name = "requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Request extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long guardianId; // 요청을 올린 보호자

    @Column(nullable = false)
    private Long seniorId; // 동행할 어르신

    @Column(nullable = false)
    private Long hospitalId; // 방문할 병원

    @Column(nullable = false)
    private LocalDate date; // 동행 날짜

    @Column(nullable = false)
    private LocalTime meetTime; // 만나는 시간

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MeetPlaceType meetPlaceType; // 만나는 장소 종류

    @Column(nullable = false)
    private String meetAddress; // 만나는 상세 주소

    @Column(nullable = false, length = 50)
    private String department; // 진료과 (자유 입력)

    @ElementCollection
    @CollectionTable(name = "request_needs", joinColumns = @JoinColumn(name = "request_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "need", length = 20)
    private List<Need> needs = new ArrayList<>(); // 필요한 도움 (여러 개)

    @Column(columnDefinition = "TEXT")
    private String notes; // 참고 사항

    @Column(nullable = false)
    private int helpersNeeded; // 필요한 봉사자 수

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private GenderPref genderPref; // 희망 성별

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus status; // 요청 상태

    @Builder
    private Request(Long guardianId, Long seniorId, Long hospitalId, LocalDate date,
                    LocalTime meetTime, MeetPlaceType meetPlaceType, String meetAddress,
                    String department, List<Need> needs, String notes,
                    int helpersNeeded, GenderPref genderPref) {
        this.guardianId = guardianId;
        this.seniorId = seniorId;
        this.hospitalId = hospitalId;
        this.date = date;
        this.meetTime = meetTime;
        this.meetPlaceType = meetPlaceType;
        this.meetAddress = meetAddress;
        this.department = department;
        this.needs = new ArrayList<>(needs);
        this.notes = notes;
        this.helpersNeeded = helpersNeeded;
        this.genderPref = genderPref;
        this.status = RequestStatus.RECRUITING; // 처음 등록하면 모집 중
    }
}