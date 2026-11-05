package com.dandi.hospital.visit.controller;

import com.dandi.hospital.global.response.ApiResponse;
import com.dandi.hospital.global.security.LoginUser;
import com.dandi.hospital.visit.dto.VisitResponse;
import com.dandi.hospital.visit.dto.CheckinResponse;
import com.dandi.hospital.visit.dto.VisitTimeRequest;
import com.dandi.hospital.visit.dto.StepUpdateRequest;
import com.dandi.hospital.visit.dto.StepUpdateResponse;
import com.dandi.hospital.visit.service.VisitQueryService;
import com.dandi.hospital.visit.service.VisitService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitController {
    private final VisitQueryService visitQueryService;
    private final VisitService visitService;

    @GetMapping("/{visitId}")
    public ApiResponse<VisitResponse> getVisit(
            @PathVariable Long visitId, @AuthenticationPrincipal LoginUser user) {
        return ApiResponse.ok(visitQueryService.getVisit(visitId, user == null ? null : user.id()));
    }

    @PostMapping("/{visitId}/checkin")
    public ApiResponse<CheckinResponse> checkin(
            @PathVariable Long visitId, @AuthenticationPrincipal LoginUser user,
            @RequestBody(required = false) VisitTimeRequest request) {
        return ApiResponse.ok(visitService.checkin(visitId, user == null ? null : user.id(),
                request == null ? null : request.time()));
    }

    @PatchMapping("/{visitId}/step")
    public ApiResponse<StepUpdateResponse> updateStep(
            @PathVariable Long visitId, @AuthenticationPrincipal LoginUser user,
            @Valid @RequestBody StepUpdateRequest request) {
        return ApiResponse.ok(visitService.updateStep(visitId, user == null ? null : user.id(), request));
    }
}
