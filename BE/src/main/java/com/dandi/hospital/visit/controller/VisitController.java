package com.dandi.hospital.visit.controller;

import com.dandi.hospital.global.response.ApiResponse;
import com.dandi.hospital.global.security.LoginUser;
import com.dandi.hospital.visit.dto.VisitResponse;
import com.dandi.hospital.visit.service.VisitQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitController {
    private final VisitQueryService visitQueryService;

    @GetMapping("/{visitId}")
    public ApiResponse<VisitResponse> getVisit(
            @PathVariable Long visitId, @AuthenticationPrincipal LoginUser user) {
        return ApiResponse.ok(visitQueryService.getVisit(visitId, user == null ? null : user.id()));
    }
}
