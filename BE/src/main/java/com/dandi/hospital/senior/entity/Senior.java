package com.dandi.hospital.senior.entity;

import com.dandi.hospital.global.entity.BaseEntity;
import com.dandi.hospital.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "seniors")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Senior extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 등록한 보호자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guardian_id", nullable = false)
    private User guardian;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(nullable = false)
    private int age;

    @Column(length = 20)
    private String phone; // 휴대폰 없는 어르신도 있어서 선택

    @Column(nullable = false, length = 30)
    private String region; // 시·군 (예: 의성군) - 게시판에 노출되는 값

    @Builder
    private Senior(User guardian, String name, int age, String phone, String region) {
        this.guardian = guardian;
        this.name = name;
        this.age = age;
        this.phone = phone;
        this.region = region;
    }

    public boolean isOwnedBy(Long userId) {
        return guardian.getId().equals(userId);
    }
}
