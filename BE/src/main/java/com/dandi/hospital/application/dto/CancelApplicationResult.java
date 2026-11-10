package com.dandi.hospital.application.dto;

import com.dandi.hospital.global.enums.ApplicationStatus;

/** DELETE /api/applications/{applicationId} 응답 */
public record CancelApplicationResult(Long applicationId, ApplicationStatus status, boolean lateCancel) {}
