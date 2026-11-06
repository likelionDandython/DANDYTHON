package com.dandi.hospital.visit.service;

import com.dandi.hospital.global.enums.Need;
import com.dandi.hospital.global.enums.VisitStep;
import com.dandi.hospital.visit.entity.ChecklistItem;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ChecklistFactory {
    public List<ChecklistItem> create(List<Need> needs) {
        List<ChecklistItem> items = new ArrayList<>();
        items.add(ChecklistItem.pending(VisitStep.MEET, "만남"));
        if (needs != null && needs.contains(Need.WHEELCHAIR))
            items.add(ChecklistItem.pending(VisitStep.WHEELCHAIR_RENTAL, "병원 입구 휠체어 대여"));
        items.add(ChecklistItem.pending(VisitStep.RECEPTION, "접수"));
        items.add(ChecklistItem.pending(VisitStep.TREATMENT, "진료·검사"));
        items.add(ChecklistItem.pending(VisitStep.PAYMENT, "수납"));
        items.add(ChecklistItem.pending(VisitStep.PHARMACY, "약 수령"));
        items.add(ChecklistItem.pending(VisitStep.SEE_OFF, "배웅"));
        return List.copyOf(items);
    }
}
