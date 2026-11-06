package com.dandi.hospital.visit.service;

import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class RecognizedMinutesCalculator {
    public int calculate(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || end.isBefore(start))
            throw new CustomException(ErrorCode.INVALID_INPUT);
        long actualMinutes = Duration.between(start, end).toMinutes();
        return (int) Math.min((actualMinutes / 30) * 30, 480L);
    }
}
