# ECommerce Application

A complete full-stack ecommerce application built with **Spring Boot** backend and **HTML/CSS/JavaScript** frontend with **Bootstrap** for responsive design.

## Features

### 🛍️ Customer Features
- **User Registration & Login** - Secure authentication system
- **Product Browsing** - Browse products by categories with search and filters
- **Shopping Cart** - Add/remove items, update quantities
- **Order Management** - Place orders with cash on delivery
- **Profile Management** - Edit personal information
- **Order History** - View past orders and track status
- **Responsive Design** - Works on desktop, tablet, and mobile

### 👨‍💼 Admin Features
- **Admin Dashboard** - Overview of sales, orders, and products
- **Product Management** - Add, edit, delete products
- **Order Management** - Update order status, view order details
- **Category Management** - Manage product categories
- **User Management** - View registered users

### 🎨 UI/UX Features
- **Hero Carousel** - Attractive product showcase
- **Category Grid** - Easy category navigation
- **Product Cards** - Beautiful product display with images
- **Search & Filters** - Advanced product filtering
- **Notifications** - Toast notifications for user feedback
- **Loading States** - Smooth loading indicators

## Technology Stack

### Backend
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA** - Database operations
- **Spring Security** - Authentication & authorization
- **PostgreSQL** - Database
- **Maven** - Dependency management

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript (ES6+)** - Interactive functionality
- **Bootstrap 5.3** - Responsive framework
- **Font Awesome** - Icons

### Database
- **PostgreSQL 15** - Primary database
- **Docker** - Containerization support

## Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- PostgreSQL 15
- Docker & Docker Compose (optional)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ECommerceApp
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - Database: localhost:5432

### Option 2: Manual Setup

1. **Setup PostgreSQL Database**
   ```sql
   CREATE DATABASE myEcomApp;
   CREATE USER postgres WITH PASSWORD 'password123';
   GRANT ALL PRIVILEGES ON DATABASE myEcomApp TO postgres;
   ```

2. **Start Backend**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   # Serve using any HTTP server, e.g.:
   python -m http.server 3000
   # or
   npx serve -p 3000
   ```

## Demo Accounts

### Admin Account
- **Username:** `admin`
- **Password:** `password`
- **Features:** Full admin access, product management, order management

### User Account
- **Username:** `john_doe`
- **Password:** `password`
- **Features:** Shopping, order placement, profile management

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user/{id}` - Get user details
- `PUT /api/auth/user/{id}` - Update user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{categoryId}` - Get products by category
- `GET /api/products/search` - Search products with filters
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/{id}` - Update product (Admin)
- `DELETE /api/products/{id}` - Delete product (Admin)

### Categories
- `GET /api/products/categories` - Get all categories
- `POST /api/products/categories` - Create category (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/user/{userId}` - Get user orders
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status (Admin)

## Database Schema

### Users Table
- id, username, email, password, firstName, lastName, phone, address, role, createdAt, updatedAt

### Categories Table
- id, name, description, imageUrl, createdAt

### Products Table
- id, name, description, price, stockQuantity, imageUrl, isActive, categoryId, createdAt, updatedAt

### Orders Table
- id, userId, totalAmount, status, shippingAddress, paymentMethod, orderDate, updatedAt

### Order Items Table
- id, orderId, productId, quantity, price, subtotal

## Configuration

### Backend Configuration (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/myEcomApp
    username: postgres
    password: password123
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
server:
  port: 8080
```

### Frontend Configuration (js/app.js)
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## Development

### Adding New Features

1. **Backend**: Add new controllers, services, and entities in respective packages
2. **Frontend**: Add new JavaScript functions and HTML templates
3. **Database**: Update schema through JPA entities

### Code Structure

```
ECommerceApp/
├── backend/
│   ├── src/main/java/com/ecommerce/app/
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Data access
│   │   ├── entity/         # JPA entities
│   │   ├── config/         # Configuration
│   │   └── dto/            # Data transfer objects
│   └── src/main/resources/
│       ├── application.yml # Configuration
│       └── data.sql        # Sample data
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── css/style.css       # Styles
│   └── js/                 # JavaScript files
│       ├── app.js          # Main application
│       ├── auth.js         # Authentication
│       ├── products.js     # Product management
│       ├── cart.js         # Shopping cart
│       ├── orders.js       # Order management
│       └── admin.js        # Admin functionality
└── docker-compose.yml     # Docker configuration
```

## Deployment

### Production Deployment

1. **Build Backend**
   ```bash
   cd backend
   mvn clean package -DskipTests
   ```

2. **Configure Environment Variables**
   ```bash
   export SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/myEcomApp
   export SPRING_DATASOURCE_USERNAME=your-username
   export SPRING_DATASOURCE_PASSWORD=your-password
   ```

3. **Deploy Frontend**
   - Upload frontend files to web server
   - Update API_BASE_URL in app.js

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Email: support@ecommerce-app.com

## Roadmap

### Upcoming Features
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Social media login

---

**Happy Shopping! 🛒**