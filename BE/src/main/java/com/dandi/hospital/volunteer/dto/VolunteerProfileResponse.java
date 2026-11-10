package com.dandi.hospital.volunteer.dto;

import com.dandi.hospital.global.enums.Gender;
import com.dandi.hospital.volunteer.entity.Volunteer;

import java.util.List;

public record VolunteerProfileResponse(
        Long userId, String name, int age, Gender gender,
        String school, String major, int grade, String hometown, String intro, String photoUrl,
        boolean verified,
        List<String> regions, List<String> availableDays, List<String> transports, List<String> abilities,
        int visitCount, int totalMinutes, List<ThanksMessage> thanksMessages
) {
    public record ThanksMessage(String message, String createdAt) {}

    public static VolunteerProfileResponse of(Volunteer v, int visitCount, int totalMinutes, List<ThanksMessage> thanks) {
        return new VolunteerProfileResponse(
                v.getUser().getId(), v.getUser().getName(), v.getAge(), v.getGender(),
                v.getSchool(), v.getMajor(), v.getGrade(), v.getHometown(), v.getIntro(), v.getPhotoUrl(),
                v.isVerified(),
                v.getRegions(), v.getAvailableDays(), v.getTransports(), v.getAbilities(),
                visitCount, totalMinutes, thanks);
    }
}
