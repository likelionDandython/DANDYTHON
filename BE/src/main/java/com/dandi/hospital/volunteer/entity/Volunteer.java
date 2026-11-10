package com.dandi.hospital.volunteer.entity;

import com.dandi.hospital.global.entity.BaseEntity;
import com.dandi.hospital.global.entity.StringListConverter;
import com.dandi.hospital.global.enums.Gender;
import com.dandi.hospital.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/** 봉사자 프로필 (User 1:1). 승인 절차 없음 → 작성 즉시 활동 가능 */
@Entity
@Table(name = "volunteers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Volunteer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private int age;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(length = 50)  private String school;
    @Column(length = 50)  private String major;
    private int grade;
    @Column(length = 50)  private String hometown;
    @Column(length = 300) private String intro;
    @Column(length = 500) private String photoUrl;

    /** 재학 인증 여부 (P1, 지금은 항상 false) */
    private boolean verified;

    @Convert(converter = StringListConverter.class)
    @Column(length = 300)
    private List<String> regions = new ArrayList<>();       // 활동 지역 (예: 대구 북구, 칠곡군)

    @Convert(converter = StringListConverter.class)
    @Column(length = 100)
    private List<String> availableDays = new ArrayList<>(); // MON~SUN

    @Convert(converter = StringListConverter.class)
    @Column(length = 100)
    private List<String> transports = new ArrayList<>();    // PUBLIC, CAR

    @Convert(converter = StringListConverter.class)
    @Column(length = 300)
    private List<String> abilities = new ArrayList<>();     // 할 수 있는 도움 (Need 값 + SIGN_LANGUAGE 등)

    public static Volunteer create(User user) {
        Volunteer v = new Volunteer();
        v.user = user;
        return v;
    }

    public void update(int age, Gender gender, String school, String major, int grade, String hometown,
                       String intro, String photoUrl, List<String> regions, List<String> availableDays,
                       List<String> transports, List<String> abilities) {
        this.age = age;
        this.gender = gender;
        this.school = school;
        this.major = major;
        this.grade = grade;
        this.hometown = hometown;
        this.intro = intro;
        this.photoUrl = photoUrl;
        this.regions = nullSafe(regions);
        this.availableDays = nullSafe(availableDays);
        this.transports = nullSafe(transports);
        this.abilities = nullSafe(abilities);
    }

    private static List<String> nullSafe(List<String> list) {
        return list == null ? new ArrayList<>() : new ArrayList<>(list);
    }
}
