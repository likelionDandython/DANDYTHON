package com.dandi.hospital.request.dto;

import com.dandi.hospital.global.enums.RequestStatus;

public record CreateRequestResult(Long requestId, RequestStatus status) {}