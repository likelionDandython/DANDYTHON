package com.dandi.hospital.user.repository;

import com.dandi.hospital.user.entity.Consent;
import com.dandi.hospital.user.entity.ConsentItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConsentRepository extends JpaRepository<Consent, Long> {
    List<Consent> findAllByUserId(Long userId);
    Optional<Consent> findByUserIdAndItem(Long userId, ConsentItem item);
}
