package com.dandi.hospital.visit.entity;

import com.dandi.hospital.global.entity.BaseEntity;
import com.dandi.hospital.global.enums.VisitStep;
import com.dandi.hospital.global.exception.CustomException;
import com.dandi.hospital.global.exception.ErrorCode;
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

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SummaryStatus summaryStatus = SummaryStatus.NONE;

    private LocalDateTime approvedAt;

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

    public void checkin(LocalDateTime time) {
        if (time == null)
            throw new CustomException(ErrorCode.INVALID_INPUT);
        if (startedAt != null || endedAt != null
                || checklist.stream().noneMatch(item -> item.step() == VisitStep.MEET))
            throw new CustomException(ErrorCode.INVALID_STATUS);
        checklist = checklist.stream()
                .map(item -> item.step() == VisitStep.MEET
                        ? new ChecklistItem(item.step(), item.label(), true, time) : item)
                .toList();
        startedAt = time;
        recalculateStep();
    }

    private void recalculateStep() {
        step = checklist.stream().filter(item -> !item.done()).map(ChecklistItem::step)
                .findFirst().orElse(VisitStep.SEE_OFF);
    }

    public boolean updateStep(VisitStep requestedStep, boolean done, LocalDateTime time) {
        if (startedAt == null || endedAt != null || isApproved())
            throw new CustomException(ErrorCode.INVALID_STATUS);
        ChecklistItem target = checklist.stream().filter(item -> item.step() == requestedStep)
                .findFirst().orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));
        if (requestedStep == VisitStep.MEET && !done)
            throw new CustomException(ErrorCode.INVALID_STATUS);
        if (target.done() == done)
            return false;
        if (done && (time == null || time.isBefore(startedAt)))
            throw new CustomException(ErrorCode.INVALID_INPUT);

        checklist = checklist.stream().map(item -> item.step() == requestedStep
                ? item.withCompletion(done, time) : item).toList();
        recalculateStep();
        return true;
    }

    public boolean hasMemo() {
        return memo != null && !memo.isBlank();
    }

    public boolean hasSummary() {
        return summaryStatus == SummaryStatus.DONE || summaryStatus == SummaryStatus.FALLBACK;
    }

    public boolean isApproved() {
        return approvedAt != null;
    }
}
