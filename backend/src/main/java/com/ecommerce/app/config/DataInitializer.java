package com.ecommerce.app.config;

import com.ecommerce.app.entity.*;
import com.ecommerce.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        initializeData();
    }
    
    private void initializeData() {
        // Categories
        Category electronics = null;
        Category clothing = null;
        
        if (categoryRepository.count() == 0) {
            electronics = new Category("Electronics", "Electronic devices and gadgets");
            clothing = new Category("Clothing", "Fashion and apparel");
            Category books = new Category("Books", "Books and literature");
            categoryRepository.save(electronics);
            categoryRepository.save(clothing);
            categoryRepository.save(books);
        } else {
            electronics = categoryRepository.findByName("Electronics").orElse(null);
            clothing = categoryRepository.findByName("Clothing").orElse(null);
        }
        
        // Products
        if (productRepository.count() == 0 && electronics != null && clothing != null) {
            Product phone = new Product("Smartphone", "Latest Android smartphone", new BigDecimal("599.99"), electronics);
            phone.setStockQuantity(50);
            phone.setImageUrl("https://via.placeholder.com/400x400?text=Smartphone");
            
            Product laptop = new Product("Laptop", "High-performance laptop", new BigDecimal("1299.99"), electronics);
            laptop.setStockQuantity(25);
            laptop.setImageUrl("https://via.placeholder.com/400x400?text=Laptop");
            
            Product tshirt = new Product("T-Shirt", "Comfortable cotton t-shirt", new BigDecimal("29.99"), clothing);
            tshirt.setStockQuantity(200);
            tshirt.setImageUrl("https://via.placeholder.com/400x400?text=T-Shirt");
            
            productRepository.save(phone);
            productRepository.save(laptop);
            productRepository.save(tshirt);
        }
        
        // Create demo users for login
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin@ecommerce.com", passwordEncoder.encode("password"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Created admin user: admin/password");
        }
        
        if (!userRepository.existsByUsername("john_doe")) {
            User user = new User("john_doe", "john@example.com", passwordEncoder.encode("password"));
            user.setFirstName("John");
            user.setLastName("Doe");
            user.setPhone("123-456-7890");
            user.setAddress("123 Main St, City, State");
            userRepository.save(user);
            System.out.println("Created demo user: john_doe/password");
        }
    }
}