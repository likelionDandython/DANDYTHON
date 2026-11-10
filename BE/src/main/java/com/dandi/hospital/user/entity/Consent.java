package com.dandi.hospital.user.entity;

import com.dandi.hospital.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** 가입 시 약관 동의 기록 (동행 당일 어르신 동의는 Visit 쪽에서 따로 관리) */
@Entity
@Table(name = "consents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Consent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ConsentItem item;

    @Column(nullable = false)
    private boolean agreed;

    private LocalDateTime agreedAt;

    public static Consent of(User user, ConsentItem item, boolean agreed) {
        Consent c = new Consent();
        c.user = user;
        c.item = item;
        c.agreed = agreed;
        c.agreedAt = agreed ? LocalDateTime.now() : null;
        return c;
    }
}
