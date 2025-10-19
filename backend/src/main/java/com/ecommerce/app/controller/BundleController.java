package com.ecommerce.app.controller;

import com.ecommerce.app.entity.BundleSettings;
import com.ecommerce.app.repository.BundleSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/bundle")
@CrossOrigin(origins = "*")
public class BundleController {
    
    @Autowired
    private BundleSettingsRepository bundleSettingsRepository;
    
    @GetMapping("/settings")
    public ResponseEntity<?> getBundleSettings() {
        BundleSettings settings = bundleSettingsRepository.findAll().stream().findFirst()
            .orElseGet(() -> {
                BundleSettings newSettings = new BundleSettings();
                return bundleSettingsRepository.save(newSettings);
            });
        return ResponseEntity.ok(settings);
    }
    
    @PutMapping("/settings")
    public ResponseEntity<?> updateBundleSettings(@RequestBody Map<String, Object> data) {
        try {
            BundleSettings settings = bundleSettingsRepository.findAll().stream().findFirst()
                .orElseGet(BundleSettings::new);
            
            if (data.get("minOrderAmount") != null) {
                settings.setMinOrderAmount(new BigDecimal(data.get("minOrderAmount").toString()));
            }
            if (data.get("freeItemsCount") != null) {
                settings.setFreeItemsCount(Integer.valueOf(data.get("freeItemsCount").toString()));
            }
            if (data.get("isActive") != null) {
                settings.setIsActive(Boolean.valueOf(data.get("isActive").toString()));
            }
            
            BundleSettings saved = bundleSettingsRepository.save(settings);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bundle settings updated successfully");
            response.put("settings", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
