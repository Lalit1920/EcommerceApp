package com.ecommerce.app.controller;

import com.ecommerce.app.entity.Address;
import com.ecommerce.app.entity.User;
import com.ecommerce.app.repository.AddressRepository;
import com.ecommerce.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/addresses")
@CrossOrigin(origins = "*")
public class AddressController {
    
    @Autowired
    private AddressRepository addressRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Address>> getUserAddresses(@PathVariable Long userId) {
        List<Address> addresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        return ResponseEntity.ok(addresses);
    }
    
    @PostMapping
    public ResponseEntity<?> createAddress(@RequestBody Map<String, Object> request) {
        try {
            if (request.get("userId") == null || request.get("title") == null || 
                request.get("addressLine") == null || request.get("city") == null || 
                request.get("state") == null || request.get("zipCode") == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Required fields are missing");
                return ResponseEntity.badRequest().body(response);
            }
            
            Long userId = Long.valueOf(request.get("userId").toString());
            Optional<User> user = userRepository.findById(userId);
            
            if (!user.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }
            
            Address address = new Address();
            address.setTitle(request.get("title").toString());
            address.setAddressLine(request.get("addressLine").toString());
            address.setCity(request.get("city").toString());
            address.setState(request.get("state").toString());
            address.setZipCode(request.get("zipCode").toString());
            address.setUser(user.get());
            
            // Set fullName from user data
            String fullName = user.get().getFirstName() + " " + user.get().getLastName();
            if (fullName.trim().isEmpty()) {
                fullName = user.get().getUsername();
            }
            address.setFullName(fullName);
            
            // Set phone if provided
            if (request.get("phone") != null) {
                address.setPhone(request.get("phone").toString());
            }
            
            Boolean isDefault = request.get("isDefault") != null ? Boolean.valueOf(request.get("isDefault").toString()) : false;
            if (isDefault) {
                // Remove default from other addresses
                List<Address> userAddresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
                userAddresses.forEach(addr -> {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                });
            }
            address.setIsDefault(isDefault);
            
            Address savedAddress = addressRepository.save(address);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Address created successfully");
            response.put("address", savedAddress);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Optional<Address> existingAddress = addressRepository.findById(id);
            if (!existingAddress.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Address not found");
                return ResponseEntity.notFound().build();
            }
            
            if (request.get("title") == null || request.get("addressLine") == null || 
                request.get("city") == null || request.get("state") == null || 
                request.get("zipCode") == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Required fields are missing");
                return ResponseEntity.badRequest().body(response);
            }
            
            Address address = existingAddress.get();
            address.setTitle(request.get("title").toString());
            address.setAddressLine(request.get("addressLine").toString());
            address.setCity(request.get("city").toString());
            address.setState(request.get("state").toString());
            address.setZipCode(request.get("zipCode").toString());
            
            Boolean isDefault = request.get("isDefault") != null ? Boolean.valueOf(request.get("isDefault").toString()) : false;
            if (isDefault && !address.getIsDefault()) {
                // Remove default from other addresses
                List<Address> userAddresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(address.getUser().getId());
                userAddresses.forEach(addr -> {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                });
            }
            address.setIsDefault(isDefault);
            
            Address updatedAddress = addressRepository.save(address);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Address updated successfully");
            response.put("address", updatedAddress);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id, @RequestParam Long userId) {
        try {
            Optional<Address> address = addressRepository.findById(id);
            if (!address.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Address not found");
                return ResponseEntity.notFound().build();
            }
            
            addressRepository.deleteById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Address deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}