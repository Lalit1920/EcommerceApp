-- Insert sample categories
INSERT INTO categories (name, description, image_url, created_at) VALUES
('Electronics', 'Electronic devices and gadgets', 'https://via.placeholder.com/300x200?text=Electronics', CURRENT_TIMESTAMP),
('Clothing', 'Fashion and apparel', 'https://via.placeholder.com/300x200?text=Clothing', CURRENT_TIMESTAMP),
('Books', 'Books and literature', 'https://via.placeholder.com/300x200?text=Books', CURRENT_TIMESTAMP),
('Home & Garden', 'Home improvement and gardening', 'https://via.placeholder.com/300x200?text=Home+Garden', CURRENT_TIMESTAMP),
('Sports', 'Sports equipment and accessories', 'https://via.placeholder.com/300x200?text=Sports', CURRENT_TIMESTAMP);

-- Insert sample products
INSERT INTO products (name, description, price, stock_quantity, image_url, is_active, category_id, created_at, updated_at) VALUES
('Smartphone', 'Latest Android smartphone with 128GB storage', 599.99, 50, 'https://via.placeholder.com/400x400?text=Smartphone', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Laptop', 'High-performance laptop for work and gaming', 1299.99, 25, 'https://via.placeholder.com/400x400?text=Laptop', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Wireless Headphones', 'Noise-cancelling wireless headphones', 199.99, 100, 'https://via.placeholder.com/400x400?text=Headphones', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('T-Shirt', 'Comfortable cotton t-shirt', 29.99, 200, 'https://via.placeholder.com/400x400?text=T-Shirt', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Jeans', 'Classic blue denim jeans', 79.99, 150, 'https://via.placeholder.com/400x400?text=Jeans', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Programming Book', 'Learn programming fundamentals', 49.99, 75, 'https://via.placeholder.com/400x400?text=Programming+Book', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Coffee Table', 'Modern wooden coffee table', 299.99, 30, 'https://via.placeholder.com/400x400?text=Coffee+Table', true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Basketball', 'Professional basketball', 39.99, 80, 'https://via.placeholder.com/400x400?text=Basketball', true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert admin user
INSERT INTO users (username, email, password, first_name, last_name, role, created_at, updated_at) VALUES
('admin', 'admin@ecommerce.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample user
INSERT INTO users (username, email, password, first_name, last_name, phone, address, role, created_at, updated_at) VALUES
('john_doe', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', '123-456-7890', '123 Main St, City, State', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);