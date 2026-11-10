package com.dandi.hospital.visit.service;

import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.visit.entity.Visit;
import org.springframework.stereotype.Component;

@Component
public class VisitAccessPolicy {
    public void requireViewer(Visit visit, Request request, Long actorId) {
        requireAuthenticated(actorId);
        if (!actorId.equals(request.getGuardianId()) && !actorId.equals(visit.getVolunteerId()))
            throw new CustomException(ErrorCode.FORBIDDEN);
    }

    public void requireVolunteer(Visit visit, Long actorId) {
        requireAuthenticated(actorId);
        if (!actorId.equals(visit.getVolunteerId()))
            throw new CustomException(ErrorCode.FORBIDDEN);
    }

    public void requireRequester(Request request, Long actorId) {
        requireAuthenticated(actorId);
        if (!actorId.equals(request.getGuardianId()))
            throw new CustomException(ErrorCode.FORBIDDEN);
    }

    public void requireAuthenticated(Long actorId) {
        if (actorId == null)
            throw new CustomException(ErrorCode.UNAUTHORIZED);
    }
}
