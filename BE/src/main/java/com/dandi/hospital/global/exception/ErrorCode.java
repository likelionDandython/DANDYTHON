package com.dandi.hospital.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/** 새 에러가 필요하면 여기에 추가 (도메인별 섹션 지키기) */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 공통
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다"),
    INVALID_STATUS(HttpStatus.CONFLICT, "현재 상태에서 할 수 없는 요청입니다"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다"),

    // A: 인증·프로필
    EMAIL_DUPLICATED(HttpStatus.CONFLICT, "이미 가입된 이메일입니다"),
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다"),
    REQUIRED_CONSENT_MISSING(HttpStatus.BAD_REQUEST, "필수 동의 항목이 누락되었습니다"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다"),
    SENIOR_NOT_FOUND(HttpStatus.NOT_FOUND, "어르신 정보를 찾을 수 없습니다"),
    HOSPITAL_NOT_FOUND(HttpStatus.NOT_FOUND, "병원을 찾을 수 없습니다"),
    PROFILE_INCOMPLETE(HttpStatus.FORBIDDEN, "프로필을 먼저 완성해주세요"),

    // B: 요청·신청
    REQUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "요청을 찾을 수 없습니다"),
    APPLICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "신청을 찾을 수 없습니다"),
    ALREADY_APPLIED(HttpStatus.CONFLICT, "이미 신청한 요청입니다"),
    SCHEDULE_CONFLICT(HttpStatus.CONFLICT, "같은 시간대에 확정된 동행이 있습니다"),

    // C: 동행·요약
    VISIT_NOT_FOUND(HttpStatus.NOT_FOUND, "동행 기록을 찾을 수 없습니다"),
    CONSENT_REQUIRED(HttpStatus.BAD_REQUEST, "어르신 동의가 필요합니다");

    private final HttpStatus status;
    private final String message;
}
