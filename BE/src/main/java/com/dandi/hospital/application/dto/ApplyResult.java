package com.dandi.hospital.application.dto;

import com.dandi.hospital.global.enums.ApplicationStatus;

public record ApplyResult(Long applicationId, ApplicationStatus status) {}