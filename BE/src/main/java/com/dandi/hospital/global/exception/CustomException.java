package com.dandi.hospital.global.exception;

import lombok.Getter;

/** 사용법: throw new CustomException(ErrorCode.REQUEST_NOT_FOUND); */
@Getter
public class CustomException extends RuntimeException {
    private final ErrorCode errorCode;

    public CustomException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
