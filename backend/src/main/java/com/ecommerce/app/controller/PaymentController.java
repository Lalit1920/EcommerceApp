package com.ecommerce.app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    private Random random = new Random();
    
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> paymentData) {
        try {
            // Simulate processing delay
            Thread.sleep(2000);
            
            String cardNumber = paymentData.get("cardNumber").toString();
            String expiryDate = paymentData.get("expiryDate").toString();
            String cvv = paymentData.get("cvv").toString();
            String cardHolder = paymentData.get("cardHolder").toString();
            Double amount = Double.valueOf(paymentData.get("amount").toString());
            
            // Simulate payment validation
            Map<String, Object> response = new HashMap<>();
            
            // Demo validation rules
            if (cardNumber.equals("4111111111111111")) {
                // Success card
                response.put("success", true);
                response.put("transactionId", "TXN" + System.currentTimeMillis());
                response.put("status", "SUCCESS");
                response.put("message", "Payment processed successfully");
                response.put("amount", amount);
            } else if (cardNumber.equals("4000000000000002")) {
                // Declined card
                response.put("success", false);
                response.put("status", "DECLINED");
                response.put("message", "Card declined by bank");
                response.put("errorCode", "CARD_DECLINED");
            } else if (cardNumber.equals("4000000000000119")) {
                // Insufficient funds
                response.put("success", false);
                response.put("status", "FAILED");
                response.put("message", "Insufficient funds");
                response.put("errorCode", "INSUFFICIENT_FUNDS");
            } else {
                // Random success/failure for other cards
                boolean success = random.nextBoolean();
                if (success) {
                    response.put("success", true);
                    response.put("transactionId", "TXN" + System.currentTimeMillis());
                    response.put("status", "SUCCESS");
                    response.put("message", "Payment processed successfully");
                    response.put("amount", amount);
                } else {
                    response.put("success", false);
                    response.put("status", "FAILED");
                    response.put("message", "Payment processing failed");
                    response.put("errorCode", "PROCESSING_ERROR");
                }
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("status", "ERROR");
            response.put("message", "Payment gateway error");
            response.put("errorCode", "GATEWAY_ERROR");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/test-cards")
    public ResponseEntity<?> getTestCards() {
        Map<String, Object> response = new HashMap<>();
        response.put("testCards", new Object[]{
            Map.of("number", "4111111111111111", "type", "Visa", "result", "Success"),
            Map.of("number", "4000000000000002", "type", "Visa", "result", "Declined"),
            Map.of("number", "4000000000000119", "type", "Visa", "result", "Insufficient Funds"),
            Map.of("number", "5555555555554444", "type", "Mastercard", "result", "Random"),
            Map.of("number", "378282246310005", "type", "American Express", "result", "Random")
        });
        return ResponseEntity.ok(response);
    }
}