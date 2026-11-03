package com.dandi.hospital.user.entity;

import com.dandi.hospital.global.entity.BaseEntity;
import com.dandi.hospital.global.enums.Role;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password; // BCrypt 암호화된 값

    @Column(nullable = false, length = 30)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    /** 보호자는 가입 즉시 true, 봉사자는 프로필 작성 후 true */
    @Column(nullable = false)
    private boolean profileCompleted;

    @Builder
    private User(String email, String password, String name, String phone, Role role) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.phone = phone;
        this.role = role;
        this.profileCompleted = (role == Role.GUARDIAN);
    }

    /** 봉사자 프로필 저장 시 호출 */
    public void completeProfile() {
        this.profileCompleted = true;
    }
}
