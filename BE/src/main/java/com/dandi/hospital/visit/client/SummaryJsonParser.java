package com.dandi.hospital.visit.client;

import com.dandi.hospital.visit.entity.SummaryContent;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.*;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class SummaryJsonParser {
    private final ObjectMapper mapper;
    private static final Set<String> FIELDS = Set.of("todayPoints", "nextVisit", "medication", "guardianTodo");

    public SummaryJsonParser(ObjectMapper mapper) {
        this.mapper = mapper.copy().enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS)
                .enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION);
    }

    public SummaryContent parse(String text) {
        if (text == null || text.length() > 12000)
            throw invalid();
        try {
            JsonNode root = mapper.readTree(text);
            if (root == null || !root.isObject())
                throw invalid();
            Set<String> fields = new HashSet<>();
            root.fieldNames().forEachRemaining(fields::add);
            if (!fields.equals(FIELDS))
                throw invalid();
            List<String> points = strings(root.get("todayPoints"), 3);
            while (points.size() < 3)
                points.add("기록 없음");
            return new SummaryContent(points, string(root.get("nextVisit"), 1000),
                    string(root.get("medication"), 1000), strings(root.get("guardianTodo"), 10),
                    SummaryContent.DISCLAIMER);
        } catch (JsonProcessingException e) {
            throw invalid();
        }
    }

    private List<String> strings(JsonNode node, int maxItems) {
        if (node == null || !node.isArray() || node.isEmpty() || node.size() > maxItems)
            throw invalid();
        List<String> values = new ArrayList<>();
        for (JsonNode item : node)
            values.add(string(item, 500));
        return values;
    }

    private String string(JsonNode node, int maxLength) {
        if (node == null || !node.isTextual())
            throw invalid();
        String value = node.textValue().strip();
        if (value.length() > maxLength || value.contains("<") || value.contains(">"))
            throw invalid();
        return value.isBlank() ? "기록 없음" : value;
    }

    private SummaryAiException invalid() {
        return new SummaryAiException(SummaryAiException.Reason.INVALID_RESPONSE);
    }
}
