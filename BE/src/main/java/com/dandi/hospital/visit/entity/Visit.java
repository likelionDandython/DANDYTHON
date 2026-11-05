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
    public static final int MAX_MEMO_LENGTH = 5000;

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
    private Integer recognizedMinutes;

    @Column(nullable = false)
    private boolean consent;

    private LocalDateTime consentedAt;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Column(nullable = false)
    private long memoRevision;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SummaryStatus summaryStatus = SummaryStatus.NONE;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private SummaryContent summary;

    private Long summaryMemoRevision;
    private LocalDateTime summarizedAt;

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
        if (startedAt != null || endedAt != null || checklist.stream().noneMatch(item -> item.step() == VisitStep.MEET))
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

    public void checkout(LocalDateTime time, int minutes) {
        if (startedAt == null || endedAt != null || isApproved())
            throw new CustomException(ErrorCode.INVALID_STATUS);
        if (time == null || time.isBefore(startedAt) || minutes < 0 || minutes > 480 || minutes % 30 != 0)
            throw new CustomException(ErrorCode.INVALID_INPUT);
        endedAt = time;
        recognizedMinutes = minutes;
    }

    public void saveMemo(boolean agreed, String content, LocalDateTime time) {
        if (startedAt == null || isApproved())
            throw new CustomException(ErrorCode.INVALID_STATUS);
        if (!agreed)
            throw new CustomException(ErrorCode.CONSENT_REQUIRED);
        if (content == null || content.isBlank() || content.length() > MAX_MEMO_LENGTH || time == null)
            throw new CustomException(ErrorCode.INVALID_INPUT);

        consent = true;
        if (consentedAt == null)
            consentedAt = time;
        if (!content.equals(memo)) {
            memo = content;
            memoRevision++;
            summaryStatus = SummaryStatus.NONE;
            summary = null;
            summaryMemoRevision = null;
            summarizedAt = null;
        }
    }

    public boolean hasMemo() {
        return memo != null && !memo.isBlank();
    }

    public void saveSummary(long sourceRevision, SummaryContent content, LocalDateTime time) {
        if (startedAt == null || isApproved() || memoRevision != sourceRevision)
            throw new CustomException(ErrorCode.INVALID_STATUS);
        if (!consent)
            throw new CustomException(ErrorCode.CONSENT_REQUIRED);
        if (!hasMemo() || time == null)
            throw new CustomException(ErrorCode.INVALID_INPUT);
        summary = content;
        summaryStatus = content == null ? SummaryStatus.FALLBACK : SummaryStatus.DONE;
        summaryMemoRevision = sourceRevision;
        summarizedAt = time;
    }

    public boolean hasSummary() {
        return summaryStatus == SummaryStatus.DONE || summaryStatus == SummaryStatus.FALLBACK;
    }

    public boolean isApproved() {
        return approvedAt != null;
    }
}
