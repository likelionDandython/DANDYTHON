package com.dandi.hospital.visit.service;

import com.dandi.hospital.visit.client.SummaryAiException;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.Map;
import java.util.regex.Pattern;

@Component
public class MemoSanitizer {
    private static final String REDACTED = "[식별정보 삭제]";
    private static final Pattern EMAIL = Pattern.compile("[\\w.+-]+@[\\w.-]+\\.[a-zA-Z]{2,}");
    private static final Pattern PHONE = Pattern.compile("(?<!\\d)(?:\\+82[- .]?|0)(?:1[016789]|[2-6][1-5]?|70)[- .]?\\d{3,4}[- .]?\\d{4}(?!\\d)");
    private static final Pattern ID_NUMBER = Pattern.compile("(?<!\\d)\\d{6}[- ]?[1-8]\\d{6}(?!\\d)");
    private static final Pattern LABELED_NAME = Pattern.compile("(?:환자명|성명|이름)\\s*[:：]\\s*[가-힣a-zA-Z]{2,30}");
    private static final Pattern HONORIFIC_NAME = Pattern.compile("[가-힣]{2,4}\\s*님");
    private static final Pattern UNSAFE_REMAINDER = Pattern.compile(
            "https?://|@|\\d{5,}|(?:로|길)\\s*\\d|(?:주소|연락처|전화번호|학교|고향)\\s*[:：]", Pattern.CASE_INSENSITIVE);
    private static final Map<String, String> DEPARTMENTS = Map.ofEntries(
            Map.entry("INTERNAL_MEDICINE", "내과"), Map.entry("ORTHOPEDICS", "정형외과"),
            Map.entry("ORTHOPEDIC_SURGERY", "정형외과"), Map.entry("NEUROLOGY", "신경과"),
            Map.entry("NEUROSURGERY", "신경외과"), Map.entry("SURGERY", "외과"),
            Map.entry("OPHTHALMOLOGY", "안과"), Map.entry("ENT", "이비인후과"),
            Map.entry("OTOLARYNGOLOGY", "이비인후과"), Map.entry("DERMATOLOGY", "피부과"),
            Map.entry("UROLOGY", "비뇨의학과"), Map.entry("DENTISTRY", "치과"),
            Map.entry("FAMILY_MEDICINE", "가정의학과"), Map.entry("REHABILITATION_MEDICINE", "재활의학과"),
            Map.entry("PSYCHIATRY", "정신건강의학과"), Map.entry("OBSTETRICS_GYNECOLOGY", "산부인과"),
            Map.entry("PEDIATRICS", "소아청소년과"), Map.entry("OTHER", "기타"));

    public String sanitize(SummaryContext context) {
        String result = context.memo();
        for (String identifier : context.identifiers().stream()
                .sorted(Comparator.comparingInt(String::length).reversed()).toList()) {
            String compact = identifier.replaceAll("\\s+", "");
            if (compact.length() < 2)
                continue;
            String expression = compact.codePoints().mapToObj(cp -> Pattern.quote(new String(Character.toChars(cp))))
                    .collect(java.util.stream.Collectors.joining("\\s*"));
            result = Pattern.compile(expression, Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)
                    .matcher(result).replaceAll(REDACTED);
        }
        for (Pattern pattern : new Pattern[]{EMAIL, PHONE, ID_NUMBER, LABELED_NAME, HONORIFIC_NAME})
            result = pattern.matcher(result).replaceAll(REDACTED);
        if (UNSAFE_REMAINDER.matcher(result).find())
            throw new SummaryAiException(SummaryAiException.Reason.UNSAFE_INPUT);
        return result;
    }

    public String departmentLabel(String value) {
        if (value == null)
            return "기록 없음";
        String department = value.strip();
        if (DEPARTMENTS.containsValue(department))
            return department;
        return DEPARTMENTS.getOrDefault(department, "기록 없음");
    }
}
