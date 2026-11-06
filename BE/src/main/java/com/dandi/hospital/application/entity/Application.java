package com.dandi.hospital.application.entity;

import com.dandi.hospital.global.entity.BaseEntity;
import com.dandi.hospital.global.enums.ApplicationStatus;
import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 봉사자가 동행 요청에 보낸 신청 */
@Entity
@Table(name = "applications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Application extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long requestId; // 신청한 요청

    @Column(nullable = false)
    private Long volunteerId; // 신청한 봉사자의 User ID

    @Column(length = 300)
    private String message; // 보호자에게 보내는 한마디

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status; // 신청 상태

    @Builder
    private Application(Long requestId, Long volunteerId, String message) {
        this.requestId = requestId;
        this.volunteerId = volunteerId;
        this.message = message;
        this.status = ApplicationStatus.PENDING; // 처음 신청하면 대기 중
    }

    /** 상태 변경: 지금 상태가 expected일 때만 next로 바꿈 */
    public void changeStatus(ApplicationStatus expected, ApplicationStatus next) {
        if (status != expected)
            throw new CustomException(ErrorCode.INVALID_STATUS);
        status = next;
    }
}
