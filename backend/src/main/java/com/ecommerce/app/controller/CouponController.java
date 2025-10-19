package com.ecommerce.app.controller;

import com.ecommerce.app.entity.Coupon;
import com.ecommerce.app.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/coupons")
@CrossOrigin(origins = "*")
public class CouponController {
    
    @Autowired
    private CouponRepository couponRepository;
    
    @GetMapping
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponRepository.findAll());
    }
    
    @PostMapping
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        try {
            coupon.setCreatedAt(LocalDateTime.now());
            Coupon savedCoupon = couponRepository.save(coupon);
            return ResponseEntity.ok(savedCoupon);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error creating coupon: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody Map<String, Object> request) {
        try {
            String code = request.get("code").toString();
            Double orderAmount = Double.valueOf(request.get("orderAmount").toString());
            
            Optional<Coupon> couponOpt = couponRepository.findValidCouponByCode(code, LocalDateTime.now());
            
            if (!couponOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("valid", false);
                response.put("message", "Invalid or expired coupon");
                return ResponseEntity.ok(response);
            }
            
            Coupon coupon = couponOpt.get();
            
            if (orderAmount < coupon.getMinOrderAmount()) {
                Map<String, Object> response = new HashMap<>();
                response.put("valid", false);
                response.put("message", "Minimum order amount is ₹" + coupon.getMinOrderAmount());
                return ResponseEntity.ok(response);
            }
            
            Double discountAmount = (orderAmount * coupon.getDiscountPercentage()) / 100;
            if (discountAmount > coupon.getMaxDiscountAmount()) {
                discountAmount = coupon.getMaxDiscountAmount();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("discountAmount", discountAmount);
            response.put("finalAmount", orderAmount - discountAmount);
            response.put("coupon", coupon);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", "Error validating coupon");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody Coupon coupon) {
        try {
            Optional<Coupon> existingCoupon = couponRepository.findById(id);
            if (!existingCoupon.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Coupon not found");
                return ResponseEntity.badRequest().body(response);
            }
            
            coupon.setId(id);
            coupon.setCreatedAt(existingCoupon.get().getCreatedAt());
            Coupon updatedCoupon = couponRepository.save(coupon);
            return ResponseEntity.ok(updatedCoupon);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating coupon");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        try {
            couponRepository.deleteById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Coupon deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting coupon");
            return ResponseEntity.badRequest().body(response);
        }
    }
}