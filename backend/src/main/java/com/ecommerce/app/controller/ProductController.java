// package com.ecommerce.app.controller;

// import com.ecommerce.app.entity.Product;
// import com.ecommerce.app.entity.Category;
// import com.ecommerce.app.entity.User;
// import com.ecommerce.app.service.ProductService;
// import com.ecommerce.app.service.UserService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.PageRequest;
// import org.springframework.data.domain.Pageable;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import java.math.BigDecimal;
// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;
// import java.util.Optional;

// @RestController
// @RequestMapping("/products")
// @CrossOrigin(origins = "*")
// public class ProductController {
    
//     @Autowired
//     private ProductService productService;
    
//     @Autowired
//     private UserService userService;
    
//     @GetMapping("/cart-test")
//     public ResponseEntity<?> cartTest() {
//         Map<String, Object> response = new HashMap<>();
//         response.put("success", true);
//         response.put("message", "Cart test working from ProductController");
//         return ResponseEntity.ok(response);
//     }
    
//     @GetMapping
//     public ResponseEntity<List<Product>> getAllProducts() {
//         List<Product> products = productService.getAllActiveProducts();
//         return ResponseEntity.ok(products);
//     }
    
//     @GetMapping("/{id}")
//     public ResponseEntity<Product> getProductById(@PathVariable Long id) {
//         Optional<Product> product = productService.getProductById(id);
//         return product.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
//     }
    
//     @GetMapping("/category/{categoryId}")
//     public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
//         List<Product> products = productService.getProductsByCategory(categoryId);
//         return ResponseEntity.ok(products);
//     }
    
//     @GetMapping("/search")
//     public ResponseEntity<Page<Product>> searchProducts(
//             @RequestParam(required = false) Long categoryId,
//             @RequestParam(required = false) BigDecimal minPrice,
//             @RequestParam(required = false) BigDecimal maxPrice,
//             @RequestParam(required = false) String searchTerm,
//             @RequestParam(defaultValue = "0") int page,
//             @RequestParam(defaultValue = "12") int size) {
        
//         Pageable pageable = PageRequest.of(page, size);
//         Page<Product> products = productService.getProductsWithFilters(categoryId, minPrice, maxPrice, searchTerm, pageable);
//         return ResponseEntity.ok(products);
//     }
    
//     @GetMapping("/quick-search")
//     public ResponseEntity<List<Product>> quickSearch(@RequestParam String searchTerm) {
//         List<Product> products = productService.searchProducts(searchTerm);
//         return ResponseEntity.ok(products);
//     }
    
//     @GetMapping
//     public Page<Product> getProducts(
//         @RequestParam(defaultValue = "0") int page,
//         @RequestParam(defaultValue = "10") int size
//     ) {
//         return productService.getPaginatedProducts(page, size);
//     }

    
//     @PostMapping
//     public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> requestData) {
//         try {
//             Long userId = Long.valueOf(requestData.get("userId").toString());
//             Optional<User> user = userService.findById(userId);
            
//             if (!user.isPresent() || !"ADMIN".equals(user.get().getRole().toString())) {
//                 Map<String, Object> response = new HashMap<>();
//                 response.put("success", false);
//                 response.put("message", "Access denied. Admin privileges required.");
//                 return ResponseEntity.status(403).body(response);
//             }
            
//             Product product = new Product();
//             product.setName(requestData.get("name").toString());
//             product.setDescription(requestData.get("description").toString());
//             product.setPrice(new BigDecimal(requestData.get("price").toString()));
//             product.setStockQuantity(Integer.valueOf(requestData.get("stockQuantity").toString()));
//             product.setDeliveryCharge(requestData.get("deliveryCharge") != null ? new BigDecimal(requestData.get("deliveryCharge").toString()) : BigDecimal.ZERO);
//             product.setImageUrl(requestData.get("imageUrl").toString());
            
//             if (requestData.get("categoryId") != null) {
//                 Long categoryId = Long.valueOf(requestData.get("categoryId").toString());
//                 Optional<Category> category = productService.getAllCategories().stream()
//                     .filter(c -> c.getId().equals(categoryId)).findFirst();
//                 if (category.isPresent()) {
//                     product.setCategory(category.get());
//                 }
//             }
            
//             Product createdProduct = productService.createProduct(product);
            
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", true);
//             response.put("message", "Product created successfully");
//             response.put("product", createdProduct);
//             return ResponseEntity.ok(response);
            
//         } catch (Exception e) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(response);
//         }
//     }
    
//     @PutMapping("/{id}")
//     public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> requestData) {
//         try {
//             // Check if userId is provided
//             if (requestData.get("userId") == null) {
//                 Map<String, Object> response = new HashMap<>();
//                 response.put("success", false);
//                 response.put("message", "User ID is required");
//                 return ResponseEntity.badRequest().body(response);
//             }
            
//             Long userId = Long.valueOf(requestData.get("userId").toString());
//             Optional<User> user = userService.findById(userId);
            
//             if (!user.isPresent() || !"ADMIN".equals(user.get().getRole().toString())) {
//                 Map<String, Object> response = new HashMap<>();
//                 response.put("success", false);
//                 response.put("message", "Access denied. Admin privileges required.");
//                 return ResponseEntity.status(403).body(response);
//             }
            
//             Optional<Product> existingProduct = productService.getProductById(id);
//             if (existingProduct.isPresent()) {
//                 Product product = existingProduct.get();
                
//                 // Validate required fields
//                 if (requestData.get("name") == null || requestData.get("price") == null || requestData.get("stockQuantity") == null) {
//                     Map<String, Object> response = new HashMap<>();
//                     response.put("success", false);
//                     response.put("message", "Name, price, and stock quantity are required");
//                     return ResponseEntity.badRequest().body(response);
//                 }
                
//                 product.setName(requestData.get("name").toString());
//                 product.setDescription(requestData.get("description") != null ? requestData.get("description").toString() : "");
//                 product.setPrice(new BigDecimal(requestData.get("price").toString()));
//                 product.setStockQuantity(Integer.valueOf(requestData.get("stockQuantity").toString()));
//                 product.setDeliveryCharge(requestData.get("deliveryCharge") != null ? new BigDecimal(requestData.get("deliveryCharge").toString()) : BigDecimal.ZERO);
//                 product.setImageUrl(requestData.get("imageUrl") != null ? requestData.get("imageUrl").toString() : "");
                
//                 if (requestData.get("categoryId") != null && !requestData.get("categoryId").toString().isEmpty()) {
//                     Long categoryId = Long.valueOf(requestData.get("categoryId").toString());
//                     Optional<Category> category = productService.getAllCategories().stream()
//                         .filter(c -> c.getId().equals(categoryId)).findFirst();
//                     if (category.isPresent()) {
//                         product.setCategory(category.get());
//                     }
//                 }
                
//                 Product updatedProduct = productService.saveProduct(product);
                
//                 Map<String, Object> response = new HashMap<>();
//                 response.put("success", true);
//                 response.put("message", "Product updated successfully");
//                 response.put("product", updatedProduct);
//                 return ResponseEntity.ok(response);
//             }
            
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", "Product not found");
//             return ResponseEntity.status(404).body(response);
            
//         } catch (NumberFormatException e) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", "Invalid number format: " + e.getMessage());
//             return ResponseEntity.badRequest().body(response);
//         } catch (Exception e) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", "Error updating product: " + e.getMessage());
//             return ResponseEntity.badRequest().body(response);
//         }
//     }
    
//     @DeleteMapping("/{id}")
//     public ResponseEntity<?> deleteProduct(@PathVariable Long id, @RequestParam Long userId) {
//         try {
//             Optional<User> user = userService.findById(userId);
            
//             if (!user.isPresent() || !"ADMIN".equals(user.get().getRole().toString())) {
//                 Map<String, Object> response = new HashMap<>();
//                 response.put("success", false);
//                 response.put("message", "Access denied. Admin privileges required.");
//                 return ResponseEntity.status(403).body(response);
//             }
            
//             productService.deleteProduct(id);
            
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", true);
//             response.put("message", "Product deleted successfully");
//             return ResponseEntity.ok(response);
            
//         } catch (Exception e) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(response);
//         }
//     }
    
//     @GetMapping("/categories")
//     public ResponseEntity<List<Category>> getAllCategories() {
//         List<Category> categories = productService.getAllCategories();
//         return ResponseEntity.ok(categories);
//     }
    
//     @PostMapping("/categories")
//     public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> requestData) {
//         try {
//             Long userId = Long.valueOf(requestData.get("userId").toString());
//             Optional<User> user = userService.findById(userId);
            
//             if (!user.isPresent() || !"ADMIN".equals(user.get().getRole().toString())) {
//                 Map<String, Object> response = new HashMap<>();
//                 response.put("success", false);
//                 response.put("message", "Access denied. Admin privileges required.");
//                 return ResponseEntity.status(403).body(response);
//             }
            
//             Category category = new Category();
//             category.setName(requestData.get("name").toString());
//             category.setDescription(requestData.get("description").toString());
//             category.setImageUrl(requestData.get("imageUrl").toString());
//             if (requestData.get("discountPercentage") != null) {
//                 category.setDiscountPercentage(Integer.valueOf(requestData.get("discountPercentage").toString()));
//             }
            
//             Category createdCategory = productService.saveCategory(category);
            
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", true);
//             response.put("message", "Category created successfully");
//             response.put("category", createdCategory);
//             return ResponseEntity.ok(response);
            
//         } catch (Exception e) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(response);
//         }
//     }
    
//     @PutMapping("/categories/{id}")
//     public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> requestData) {
//         try {
//             Long userId = Long.valueOf(requestData.get("userId").toString());
//             Optional<User> user = userService.findById(userId);
            
//             if (!user.isPresent() || !"ADMIN".equals(user.get().getRole().toString())) {
//                 Map<String, Object> response = new HashMap<>();
//                 response.put("success", false);
//                 response.put("message", "Access denied. Admin privileges required.");
//                 return ResponseEntity.status(403).body(response);
//             }
            
//             Optional<Category> existingCategory = productService.getCategoryById(id);
                
//             if (existingCategory.isPresent()) {
//                 Category category = existingCategory.get();
//                 category.setName(requestData.get("name").toString());
//                 category.setDescription(requestData.get("description").toString());
//                 category.setImageUrl(requestData.get("imageUrl").toString());
//                 if (requestData.get("discountPercentage") != null) {
//                     category.setDiscountPercentage(Integer.valueOf(requestData.get("discountPercentage").toString()));
//                 }
                
//                 Category updatedCategory = productService.saveCategory(category);
                
//                 Map<String, Object> response = new HashMap<>();
//                 response.put("success", true);
//                 response.put("message", "Category updated successfully");
//                 response.put("category", updatedCategory);
//                 return ResponseEntity.ok(response);
//             }
            
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", "Category not found");
//             return ResponseEntity.status(404).body(response);
            
//         } catch (Exception e) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(response);
//         }
//     }
    
//     @DeleteMapping("/categories/{id}")
//     public ResponseEntity<?> deleteCategory(@PathVariable Long id, @RequestParam Long userId) {
//         try {
//             Optional<User> user = userService.findById(userId);
            
//             if (!user.isPresent() || !"ADMIN".equals(user.get().getRole().toString())) {
//                 Map<String, Object> response = new HashMap<>();
//                 response.put("success", false);
//                 response.put("message", "Access denied. Admin privileges required.");
//                 return ResponseEntity.status(403).body(response);
//             }
            
//             productService.deleteCategory(id);
            
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", true);
//             response.put("message", "Category deleted successfully");
//             return ResponseEntity.ok(response);
            
//         } catch (Exception e) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(response);
//         }
//     }
// }

package com.ecommerce.app.controller;

import com.ecommerce.app.entity.Product;
import com.ecommerce.app.entity.Category;
import com.ecommerce.app.entity.User;
import com.ecommerce.app.service.ProductService;
import com.ecommerce.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @GetMapping("/cart-test")
    public ResponseEntity<?> cartTest() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Cart test working from ProductController");
        return ResponseEntity.ok(response);
    }

    // Unified endpoint for all products or paginated products
    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        if (page != null && size != null) {
            Pageable pageable = PageRequest.of(page, size);
            Page<Product> products = productService.getPaginatedProducts(page, size);
            return ResponseEntity.ok(products);
        } else {
            List<Product> products = productService.getAllActiveProducts();
            return ResponseEntity.ok(products);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        return product.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        List<Product> products = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Product>> searchProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productService.getProductsWithFilters(categoryId, minPrice, maxPrice, searchTerm, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/quick-search")
    public ResponseEntity<List<Product>> quickSearch(@RequestParam String searchTerm) {
        List<Product> products = productService.searchProducts(searchTerm);
        return ResponseEntity.ok(products);
    }

    // -------------------- PRODUCT MANAGEMENT --------------------

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> requestData) {
        try {
            Long userId = Long.valueOf(requestData.get("userId").toString());
            Optional<User> user = userService.findById(userId);

            if (!user.isPresent() || !"ADMIN".equals(user.get().getRole().toString())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied. Admin privileges required.");
                return ResponseEntity.status(403).body(response);
            }

            Product product = new Product();
            product.setName(requestData.get("name").toString());
            product.setDescription(requestData.get("description").toString());
            product.setPrice(new BigDecimal(requestData.get("price").toString()));
            product.setStockQuantity(Integer.valueOf(requestData.get("stockQuantity").toString()));
            product.setDeliveryCharge(requestData.get("deliveryCharge") != null ? new BigDecimal(requestData.get("deliveryCharge").toString()) : BigDecimal.ZERO);
            product.setImageUrl(requestData.get("imageUrl").toString());

            if (requestData.get("categoryId") != null) {
                Long categoryId = Long.valueOf(requestData.get("categoryId").toString());
                Optional<Category> category = productService.getAllCategories().stream()
                        .filter(c -> c.getId().equals(categoryId)).findFirst();
                category.ifPresent(product::setCategory);
            }

            Product createdProduct = productService.createProduct(product);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product created successfully");
            response.put("product", createdProduct);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> requestData) {
        try {
            Long userId = Long.valueOf(requestData.get("userId").toString());
            Optional<User> user = userService.findById(userId);

            if (!user.isPresent() || !"ADMIN".equals(user.get().getRole().toString())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied. Admin privileges required.");
                return ResponseEntity.status(403).body(response);
            }

            Optional<Product> existingProduct = productService.getProductById(id);
            if (existingProduct.isPresent()) {
                Product product = existingProduct.get();

                // Validate required fields
                if (requestData.get("name") == null || requestData.get("price") == null || requestData.get("stockQuantity") == null) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Name, price, and stock quantity are required");
                    return ResponseEntity.badRequest().body(response);
                }

                product.setName(requestData.get("name").toString());
                product.setDescription(requestData.get("description") != null ? requestData.get("description").toString() : "");
                product.setPrice(new BigDecimal(requestData.get("price").toString()));
                product.setStockQuantity(Integer.valueOf(requestData.get("stockQuantity").toString()));
                product.setDeliveryCharge(requestData.get("deliveryCharge") != null ? new BigDecimal(requestData.get("deliveryCharge").toString()) : BigDecimal.ZERO);
                product.setImageUrl(requestData.get("imageUrl") != null ? requestData.get("imageUrl").toString() : "");

                if (requestData.get("categoryId") != null && !requestData.get("categoryId").toString().isEmpty()) {
                    Long categoryId = Long.valueOf(requestData.get("categoryId").toString());
                    Optional<Category> category = productService.getAllCategories().stream()
                            .filter(c -> c.getId().equals(categoryId)).findFirst();
                    category.ifPresent(product::setCategory);
                }

                Product updatedProduct = productService.saveProduct(product);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Product updated successfully");
                response.put("product", updatedProduct);
                return ResponseEntity.ok(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Product not found");
            return ResponseEntity.status(404).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, @RequestParam Long userId) {
        try {
            Optional<User> user = userService.findById(userId);

            if (!user.isPresent() || !"ADMIN".equals(user.get().getRole().toString())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied. Admin privileges required.");
                return ResponseEntity.status(403).body(response);
            }

            productService.deleteProduct(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product deleted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // -------------------- CATEGORY MANAGEMENT --------------------

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = productService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> requestData) {
        try {
            Long userId = Long.valueOf(requestData.get("userId").toString());
            Optional<User> user = userService.findById(userId);

            if (!user.isPresent() || !"ADMIN".equals(user.get().getRole().toString())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied. Admin privileges required.");
                return ResponseEntity.status(403).body(response);
            }

            Category category = new Category();
            category.setName(requestData.get("name").toString());
            category.setDescription(requestData.get("description").toString());
            category.setImageUrl(requestData.get("imageUrl").toString());
            if (requestData.get("discountPercentage") != null) {
                category.setDiscountPercentage(Integer.valueOf(requestData.get("discountPercentage").toString()));
            }

            Category createdCategory = productService.saveCategory(category);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Category created successfully");
            response.put("category", createdCategory);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> requestData) {
        try {
            Long userId = Long.valueOf(requestData.get("userId").toString());
            Optional<User> user = userService.findById(userId);

            if (!user.isPresent() || !"ADMIN".equals(user.get().getRole().toString())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied. Admin privileges required.");
                return ResponseEntity.status(403).body(response);
            }

            Optional<Category> existingCategory = productService.getCategoryById(id);

            if (existingCategory.isPresent()) {
                Category category = existingCategory.get();
                category.setName(requestData.get("name").toString());
                category.setDescription(requestData.get("description").toString());
                category.setImageUrl(requestData.get("imageUrl").toString());
                if (requestData.get("discountPercentage") != null) {
                    category.setDiscountPercentage(Integer.valueOf(requestData.get("discountPercentage").toString()));
                }

                Category updatedCategory = productService.saveCategory(category);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Category updated successfully");
                response.put("category", updatedCategory);
                return ResponseEntity.ok(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Category not found");
            return ResponseEntity.status(404).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id, @RequestParam Long userId) {
        try {
            Optional<User> user = userService.findById(userId);

            if (!user.isPresent() || !"ADMIN".equals(user.get().getRole().toString())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied. Admin privileges required.");
                return ResponseEntity.status(403).body(response);
            }

            productService.deleteCategory(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Category deleted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
