package com.dandi.hospital.application.dto;

import com.dandi.hospital.global.enums.RequestStatus;

/** POST /api/applications/{applicationId}/accept 응답 */
public record AcceptResult(Long requestId, RequestStatus requestStatus, Long visitId) {}
