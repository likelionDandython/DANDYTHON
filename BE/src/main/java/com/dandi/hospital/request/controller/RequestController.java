package com.dandi.hospital.request.controller;

import com.dandi.hospital.global.enums.Need;
import com.dandi.hospital.global.response.ApiResponse;
import com.dandi.hospital.global.security.LoginUser;
import com.dandi.hospital.request.dto.BoardItem;
import com.dandi.hospital.request.dto.CreateRequestDto;
import com.dandi.hospital.request.dto.CreateRequestResult;
import com.dandi.hospital.request.dto.MyRequestItem;
import com.dandi.hospital.request.dto.RequestDetail;
import com.dandi.hospital.request.service.MyRequestService;
import com.dandi.hospital.request.service.RequestBoardService;
import com.dandi.hospital.request.service.RequestDetailService;
import com.dandi.hospital.request.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;
    private final RequestBoardService requestBoardService;
    private final RequestDetailService requestDetailService;
    private final MyRequestService myRequestService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('GUARDIAN')")
    public ApiResponse<CreateRequestResult> create(
            @AuthenticationPrincipal LoginUser user,
            @Valid @RequestBody CreateRequestDto dto) {
        return ApiResponse.ok(requestService.create(user.id(), dto));
    }

    @GetMapping
    public ApiResponse<List<BoardItem>> board(
            @AuthenticationPrincipal LoginUser user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false) Need need) {
        return ApiResponse.ok(requestBoardService.getBoard(user.id(), date, hospitalId, need));
    }

    @GetMapping("/{requestId}")
    public ApiResponse<RequestDetail> detail(
            @AuthenticationPrincipal LoginUser user,
            @PathVariable Long requestId) {
        return ApiResponse.ok(requestDetailService.getDetail(user.id(), requestId));
    }

    @GetMapping("/me")
    public ApiResponse<List<MyRequestItem>> mine(@AuthenticationPrincipal LoginUser user) {
        return ApiResponse.ok(myRequestService.getMine(user.id()));
    }
}
