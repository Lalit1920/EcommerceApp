package com.ecommerce.app.controller;

import com.ecommerce.app.entity.Order;
import com.ecommerce.app.entity.OrderItem;
import com.ecommerce.app.entity.Product;
import com.ecommerce.app.entity.User;
import com.ecommerce.app.service.OrderService;
import com.ecommerce.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderData) {
        try {
            Long userId = Long.valueOf(orderData.get("userId").toString());
            String shippingAddress = orderData.get("shippingAddress").toString();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) orderData.get("items");
            
            // Extract coupon data
            Double originalAmount = orderData.get("originalAmount") != null ? 
                Double.valueOf(orderData.get("originalAmount").toString()) : null;
            Double discountAmount = orderData.get("discountAmount") != null ? 
                Double.valueOf(orderData.get("discountAmount").toString()) : 0.0;
            String couponCode = orderData.get("couponCode") != null ? 
                orderData.get("couponCode").toString() : null;
            Double totalAmount = orderData.get("totalAmount") != null ? 
                Double.valueOf(orderData.get("totalAmount").toString()) : null;
            
            Optional<User> user = userService.findById(userId);
            if (!user.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }
            
            List<OrderItem> orderItems = items.stream().map(item -> {
                OrderItem orderItem = new OrderItem();
                Product product = new Product();
                product.setId(Long.valueOf(item.get("productId").toString()));
                orderItem.setProduct(product);
                orderItem.setQuantity(Integer.valueOf(item.get("quantity").toString()));
                return orderItem;
            }).toList();
            
            String paymentMethod = orderData.get("paymentMethod") != null ? 
                orderData.get("paymentMethod").toString() : "CASH_ON_DELIVERY";
            
            String bundleItems = orderData.get("bundleItems") != null ? 
                orderData.get("bundleItems").toString() : null;
            
            Order order = orderService.createOrder(user.get(), orderItems, shippingAddress, 
                originalAmount, discountAmount, couponCode, totalAmount, paymentMethod);
            
            if (bundleItems != null) {
                order.setBundleItems(bundleItems);
                orderService.saveOrder(order);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order placed successfully");
            response.put("orderId", order.getId());
            response.put("totalAmount", order.getTotalAmount());
            response.put("totalDeliveryCharges", order.getTotalDeliveryCharges());
            response.put("status", order.getStatus().toString());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Optional<Order> order = orderService.getOrderById(id);
        return order.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> statusData) {
        try {
            Order.OrderStatus status = Order.OrderStatus.valueOf(statusData.get("status"));
            Order updatedOrder = orderService.updateOrderStatus(id, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order status updated successfully");
            response.put("order", updatedOrder);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}