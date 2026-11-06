package com.dandi.hospital.visit.service;

import com.dandi.hospital.hospital.service.HospitalService;
import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
import com.dandi.hospital.request.entity.Request;
import com.dandi.hospital.request.entity.RequestTargetType;
import com.dandi.hospital.senior.service.SeniorService;
import com.dandi.hospital.user.entity.User;
import com.dandi.hospital.user.service.UserService;
import com.dandi.hospital.visit.entity.Visit;
import com.dandi.hospital.volunteer.service.VolunteerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SummaryPrivacyService {
    private final UserService userService;
    private final SeniorService seniorService;
    private final VolunteerService volunteerService;
    private final HospitalService hospitalService;

    public List<String> identifiers(Request request, Visit visit) {
        List<String> identifiers = new ArrayList<>();
        addUser(identifiers, userService.getById(request.getGuardianId()));
        var volunteer = volunteerService.getByUserId(visit.getVolunteerId());
        addUser(identifiers, volunteer.getUser());
        add(identifiers, volunteer.getSchool(), volunteer.getHometown());
        if (request.getTargetType() == RequestTargetType.FAMILY) {
            if (request.getSeniorId() == null)
                throw new CustomException(ErrorCode.INVALID_INPUT);
            var senior = seniorService.getOwnedSenior(request.getSeniorId(), request.getGuardianId());
            add(identifiers, senior.getName(), senior.getPhone(), senior.getRegion());
        }
        var hospital = hospitalService.getById(request.getHospitalId());
        add(identifiers, request.getMeetAddress(), hospital.getName(), hospital.getAddress());
        return List.copyOf(identifiers);
    }

    private void addUser(List<String> identifiers, User user) {
        add(identifiers, user.getName(), user.getPhone(), user.getEmail());
    }

    private void add(List<String> identifiers, String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank())
                identifiers.add(value);
        }
    }
}
