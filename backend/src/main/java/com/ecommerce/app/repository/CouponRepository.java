package com.ecommerce.app.repository;

import com.ecommerce.app.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);
    
    @Query("SELECT c FROM Coupon c WHERE c.code = ?1 AND c.isActive = true AND c.validFrom <= ?2 AND c.validUntil >= ?2")
    Optional<Coupon> findValidCouponByCode(String code, LocalDateTime now);
}