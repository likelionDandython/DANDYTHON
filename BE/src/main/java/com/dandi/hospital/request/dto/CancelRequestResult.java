package com.dandi.hospital.request.dto;

import com.dandi.hospital.global.enums.RequestStatus;

/** DELETE /api/requests/{requestId} 응답 */
public record CancelRequestResult(Long requestId, RequestStatus status, boolean lateCancel) {}
