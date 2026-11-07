package com.dandi.hospital.visit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record CertificateResponse(String volunteerName, String school, LocalDate date, String hospitalName,
                                  @JsonFormat(pattern = "HH:mm") LocalTime startedAt,
                                  @JsonFormat(pattern = "HH:mm") LocalTime endedAt,
                                  Integer approvedMinutes, LocalDateTime approvedAt) {
}
