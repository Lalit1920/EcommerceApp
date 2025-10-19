package com.ecommerce.app.service;

import com.ecommerce.app.entity.Order;
import com.ecommerce.app.entity.OrderItem;
import com.ecommerce.app.entity.Product;
import com.ecommerce.app.entity.User;
import com.ecommerce.app.repository.OrderRepository;
import com.ecommerce.app.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    public Order createOrder(User user, List<OrderItem> orderItems, String shippingAddress) {
        return createOrder(user, orderItems, shippingAddress, null, 0.0, null, null);
    }
    
    public Order createOrder(User user, List<OrderItem> orderItems, String shippingAddress, 
                           Double originalAmount, Double discountAmount, String couponCode, Double totalAmount) {
        return createOrder(user, orderItems, shippingAddress, originalAmount, discountAmount, couponCode, totalAmount, "CASH_ON_DELIVERY");
    }
    
    public Order createOrder(User user, List<OrderItem> orderItems, String shippingAddress, 
                           Double originalAmount, Double discountAmount, String couponCode, Double totalAmount, String paymentMethod) {
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(shippingAddress);
        order.setPaymentMethod(paymentMethod);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.PENDING);
        
        // Set coupon data
        if (originalAmount != null) {
            order.setOriginalAmount(BigDecimal.valueOf(originalAmount));
        }
        if (discountAmount != null) {
            order.setDiscountAmount(BigDecimal.valueOf(discountAmount));
        }
        if (couponCode != null) {
            order.setCouponCode(couponCode);
        }
        
        // Save order first to get ID
        order = orderRepository.save(order);
        
        BigDecimal calculatedTotal = BigDecimal.ZERO;
        BigDecimal totalDeliveryCharges = BigDecimal.ZERO;
        
        for (OrderItem item : orderItems) {
            Long productId = item.getProduct() != null ? item.getProduct().getId() : null;
            if (productId == null) {
                throw new RuntimeException("Product ID is required");
            }
            
            Optional<Product> product = productRepository.findById(productId);
            if (product.isPresent() && product.get().getStockQuantity() >= item.getQuantity()) {
                item.setOrder(order);
                item.setProduct(product.get());
                item.setPrice(product.get().getPrice());
                item.setSubtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                calculatedTotal = calculatedTotal.add(item.getSubtotal());
                
                // Add delivery charges for this product
                if (product.get().getDeliveryCharge() != null) {
                    totalDeliveryCharges = totalDeliveryCharges.add(product.get().getDeliveryCharge());
                }
                
                // Update stock
                Product p = product.get();
                p.setStockQuantity(p.getStockQuantity() - item.getQuantity());
                productRepository.save(p);
            } else {
                throw new RuntimeException("Product not available or insufficient stock for: " + productId);
            }
        }
        
        order.setTotalDeliveryCharges(totalDeliveryCharges);
        
        // Use provided total amount if available, otherwise use calculated total + delivery charges
        if (totalAmount != null) {
            order.setTotalAmount(BigDecimal.valueOf(totalAmount).add(totalDeliveryCharges));
        } else {
            order.setTotalAmount(calculatedTotal.add(totalDeliveryCharges));
        }
        
        // Set original amount if not provided
        if (originalAmount == null) {
            order.setOriginalAmount(calculatedTotal);
        }
        
        order.setOrderItems(orderItems);
        
        return orderRepository.save(order);
    }
    
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }
    
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
    
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Optional<Order> order = orderRepository.findById(orderId);
        if (order.isPresent()) {
            order.get().setStatus(status);
            order.get().setUpdatedAt(LocalDateTime.now());
            return orderRepository.save(order.get());
        }
        throw new RuntimeException("Order not found");
    }
    
    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }
}