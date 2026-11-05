package com.dandi.hospital.visit.entity;

import com.dandi.hospital.global.entity.BaseEntity;
import com.dandi.hospital.global.enums.VisitStep;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "visits", uniqueConstraints = @UniqueConstraint(
        name = "uk_visits_request_volunteer", columnNames = {"request_id", "volunteer_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Visit extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false)
    private Long requestId;

    /** Volunteer 엔티티의 PK가 아니라 봉사자 계정의 User ID다. */
    @Column(name = "volunteer_id", nullable = false)
    private Long volunteerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VisitStep step;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json", nullable = false)
    private List<ChecklistItem> checklist = new ArrayList<>();

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    @Column(nullable = false)
    private boolean consent;

    @Version
    private Long version;

    public static Visit create(Long requestId, Long volunteerId, List<ChecklistItem> checklist) {
        Visit visit = new Visit();
        visit.requestId = requestId;
        visit.volunteerId = volunteerId;
        visit.step = VisitStep.MEET;
        visit.checklist = new ArrayList<>(checklist);
        return visit;
    }

    public List<ChecklistItem> getChecklist() {
        return List.copyOf(checklist);
    }
}
