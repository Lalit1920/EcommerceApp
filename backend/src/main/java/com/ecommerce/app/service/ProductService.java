package com.ecommerce.app.service;

import com.ecommerce.app.entity.Product;
import com.ecommerce.app.entity.Category;
import com.ecommerce.app.repository.ProductRepository;
import com.ecommerce.app.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;

    
     public Page<Product> getPaginatedProducts(int page, int size) {
            return productRepository.findAll(PageRequest.of(page, size));
        }
    
    public List<Product> getAllActiveProducts() {
        return productRepository.findByIsActiveTrue();
    }
    
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }
    
    public Page<Product> getProductsWithFilters(Long categoryId, BigDecimal minPrice, 
                                               BigDecimal maxPrice, String searchTerm, 
                                               Pageable pageable) {
        return productRepository.findProductsWithFilters(categoryId, minPrice, maxPrice, searchTerm, pageable);
    }
    
    public List<Product> searchProducts(String searchTerm) {
        return productRepository.searchProducts(searchTerm);
    }
    
    public Product saveProduct(Product product) {
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }
    
    public Product createProduct(Product product) {
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }
    
    public void deleteProduct(Long id) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent()) {
            product.get().setIsActive(false);
            productRepository.save(product.get());
        }
    }
    
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }
    
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }
    
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}