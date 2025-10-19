package com.ecommerce.app.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bundle_settings")
public class BundleSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private BigDecimal minOrderAmount = BigDecimal.valueOf(1000);
    
    @Column(nullable = false)
    private Integer freeItemsCount = 3;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    public BundleSettings() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public BigDecimal getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; }
    
    public Integer getFreeItemsCount() { return freeItemsCount; }
    public void setFreeItemsCount(Integer freeItemsCount) { this.freeItemsCount = freeItemsCount; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
