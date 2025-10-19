// Main Application JavaScript

// Global Variables
const API_BASE_URL = 'http://127.0.0.1:8080/api';

// Simple fetch function
const fetchAPI = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
let currentUser = null;
let cart = [];
let categories = [];
let products = [];
let currentPage = 0;
let totalPages = 0;
let isImpersonating = false;
let originalUser = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Setup hash routing
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
    
    // Prevent video element errors from browser extensions
    window.addEventListener('error', function(e) {
        if (e.message && (e.message.includes('Video element not found') || 
                         e.message.includes('content.js') ||
                         e.message.includes('extension'))) {
            e.preventDefault();
            return false;
        }
    });
    
    // Suppress console errors from extensions
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('Video element not found') || 
            message.includes('content.js') ||
            message.includes('extension')) {
            return;
        }
        originalConsoleError.apply(console, args);
    };
});

async function initializeApp() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        loadUserCart();
        updateUserInterface();
    } else {
        // Load guest cart from localStorage
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
            cart = JSON.parse(guestCart);
        }
    }
    
    // Initialize impersonation if active
    if (typeof initializeImpersonation === 'function') {
        initializeImpersonation();
    }
    
    // Load initial data
    await categoryModule.loadCategories();
    await loadCategories();
    await loadFeaturedProducts();
    updateCartCount();
}

async function loadUserCart() {
    if (currentUser) {
        try {
            console.log('Loading cart for user:', currentUser.id);
            const response = await fetch(`${API_BASE_URL}/cart/${currentUser.id}`);
            if (response.ok) {
                const cartItems = await response.json();
                console.log('Loaded cart items from database:', cartItems);
                cart = cartItems.map(item => ({
                    productId: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    deliveryCharge: item.product.deliveryCharge || 0,
                    imageUrl: item.product.imageUrl,
                    quantity: item.quantity,
                    maxStock: item.product.stockQuantity
                }));
                console.log('Frontend cart updated:', cart);
                updateCartCount();
            } else {
                console.log('No cart found or error loading cart');
                cart = [];
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            cart = [];
        }
    } else {
        cart = [];
    }
}

async function saveCartToServer(productId, quantity, action = 'add') {
    if (!currentUser) {
        console.log('No user logged in, skipping cart save');
        return false;
    }
    
    try {
        console.log(`Saving cart to server: ${action}, productId: ${productId}, quantity: ${quantity}`);
        let url, method, body;
        
        if (action === 'add') {
            url = `${API_BASE_URL}/cart/add`;
            method = 'POST';
            body = JSON.stringify({
                userId: currentUser.id,
                productId: productId,
                quantity: quantity
            });
        } else if (action === 'update') {
            url = `${API_BASE_URL}/cart/update`;
            method = 'PUT';
            body = JSON.stringify({
                userId: currentUser.id,
                productId: productId,
                quantity: quantity
            });
        } else if (action === 'remove') {
            url = `${API_BASE_URL}/cart/remove`;
            method = 'DELETE';
            body = JSON.stringify({
                userId: currentUser.id,
                productId: productId
            });
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        });
        
        let result;
        try {
            result = await response.json();
        } catch (e) {
            console.error('Failed to parse response as JSON:', e);
            result = { success: false, message: 'Invalid server response' };
        }
        
        console.log('Cart save response:', result);
        
        if (!response.ok || !result.success) {
            console.error('Failed to save cart to server:', result.message || 'Unknown error');
            showNotification(`Failed to sync cart: ${result.message || 'Please try again'}`, 'error');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error saving cart:', error);
        showNotification('Cart sync error. Please refresh and try again.', 'error');
        return false;
    }
}

function saveUserCart() {
    // This function is now handled by individual cart operations
}

// Hash Routing
function handleRoute() {
    const hash = window.location.hash.slice(1) || '/home';
    const route = hash.split('?')[0];
    
    switch(route) {
        case '/home':
            showHome();
            break;
        case '/products':
            showProducts();
            break;
        case '/login':
            showLogin();
            break;
        case '/register':
            showRegister();
            break;
        case '/profile':
            showProfile();
            break;
        case '/cart':
            showCart();
            break;
        case '/orders':
            showOrders();
            break;
        case '/admin':
            showAdmin();
            break;
        case '/wishlist':
            showWishlist();
            break;
        default:
            showHome();
    }
}

// Navigation Functions
function showHome() {
    hideAllPages();
    document.getElementById('homePage').style.display = 'block';
    loadFeaturedProducts();
}

function showProducts() {
    hideAllPages();
    document.getElementById('productsPage').style.display = 'block';
    productModule.loadProducts();
}

function showLogin() {
    hideAllPages();
    document.getElementById('loginPage').style.display = 'block';
    loadLoginPage();
}

function showRegister() {
    hideAllPages();
    document.getElementById('registerPage').style.display = 'block';
    loadRegisterPage();
}

function showProfile() {
    if (!currentUser) {
        window.location.hash = '/login';
        return;
    }
    if (originalUser && originalUser.role === 'ADMIN') {
        showNotification('Admin cannot access user profiles', 'warning');
        return;
    }
    if (currentUser.role === 'ADMIN') {
        showNotification('Use Admin Panel > Profile to manage your profile', 'warning');
        window.location.hash = '/admin';
        return;
    }
    hideAllPages();
    document.getElementById('profilePage').style.display = 'block';
    loadProfilePage();
}

function showCart() {
    if (currentUser && currentUser.role === 'ADMIN' && !isImpersonating) {
        showNotification('Admins cannot access cart. Use impersonation to test.', 'warning');
        return;
    }
    hideAllPages();
    document.getElementById('cartPage').style.display = 'block';
    loadCartPage();
}

function showOrders() {
    if (!currentUser) {
        window.location.hash = '/login';
        return;
    }
    if (currentUser.role === 'ADMIN' && !isImpersonating) {
        showNotification('Admins cannot view personal orders. Use Admin panel to manage all orders.', 'warning');
        window.location.hash = '/admin';
        return;
    }
    hideAllPages();
    document.getElementById('ordersPage').style.display = 'block';
    loadOrdersPage();
}

function showAdmin() {
    if (!currentUser || currentUser.role !== 'ADMIN') {
        showNotification('Access denied. Admin privileges required.', 'error');
        return;
    }
    hideAllPages();
    document.getElementById('adminPage').style.display = 'block';
    loadAdminPage();
}

function showWishlist() {
    if (!currentUser) {
        window.location.hash = '/login';
        return;
    }
    if (currentUser.role === 'ADMIN' && !isImpersonating) {
        showNotification('Admins cannot access wishlist. Use impersonation to test.', 'warning');
        return;
    }
    hideAllPages();
    document.getElementById('wishlistPage').style.display = 'block';
    loadWishlistPage();
}

function hideAllPages() {
    const pages = ['homePage', 'productsPage', 'loginPage', 'registerPage', 'profilePage', 'cartPage', 'ordersPage', 'adminPage', 'wishlistPage'];
    pages.forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) page.style.display = 'none';
    });
}

// User Interface Updates
function updateUserInterface() {
    if (currentUser) {
        document.getElementById('userMenu').style.display = 'block';
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('userName').textContent = currentUser.firstName || currentUser.username;
        
        // Show admin menu only for original admin (not when impersonating)
        if (originalUser && originalUser.role === 'ADMIN') {
            document.getElementById('adminMenu').style.display = 'block';
        } else if (currentUser.role === 'ADMIN' && !isImpersonating) {
            document.getElementById('adminMenu').style.display = 'block';
        } else {
            document.getElementById('adminMenu').style.display = 'none';
        }
        
        // Hide profile for admin (even when impersonating)
        if (originalUser && originalUser.role === 'ADMIN') {
            document.getElementById('profileMenuItem').style.display = 'none';
        } else if (currentUser.role !== 'ADMIN') {
            document.getElementById('profileMenuItem').style.display = 'block';
        } else {
            document.getElementById('profileMenuItem').style.display = 'none';
        }
        
        // Show cart/wishlist/orders for regular users OR when admin is impersonating
        if (currentUser.role !== 'ADMIN' || isImpersonating) {
            document.getElementById('cartItem').style.display = 'block';
            document.getElementById('wishlistMenuItem').style.display = 'block';
            document.getElementById('ordersMenuItem').style.display = 'block';
        } else {
            document.getElementById('cartItem').style.display = 'none';
            document.getElementById('wishlistMenuItem').style.display = 'none';
            document.getElementById('ordersMenuItem').style.display = 'none';
        }
    } else {
        document.getElementById('userMenu').style.display = 'none';
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('adminMenu').style.display = 'none';
        document.getElementById('cartItem').style.display = 'block';
    }
}

// Categories Functions
async function loadCategories() {
    try {
        categories = await fetchAPI(`${API_BASE_URL}/products/categories`);
        
        // Update categories dropdown
        const categoriesMenu = document.getElementById('categoriesMenu');
        const categoryFilter = document.getElementById('categoryFilter');
        
        categoriesMenu.innerHTML = '<li><a class="dropdown-item" href="#" onclick="showProducts()">All Products</a></li>';
        
        categories.forEach(category => {
            categoriesMenu.innerHTML += `
                <li><a class="dropdown-item" href="#" onclick="filterByCategory(${category.id})">${category.name}</a></li>
            `;
        });
        
        // Use categoryModule to update filter (includes product counts for admin)
        if (typeof categoryModule !== 'undefined' && categoryModule.updateCategoryFilter) {
            await categoryModule.updateCategoryFilter();
        }
        
        // Update categories grid on home page
        updateCategoriesGrid();
        
    } catch (error) {
        console.error('Error loading categories:', error);
        // Show fallback categories
        categories = [
            {id: 1, name: 'Electronics', description: 'Electronic devices', imageUrl: 'https://via.placeholder.com/300x200/007bff/ffffff?text=Electronics'},
            {id: 2, name: 'Clothing', description: 'Fashion items', imageUrl: 'https://via.placeholder.com/300x200/28a745/ffffff?text=Clothing'},
            {id: 3, name: 'Books', description: 'Books and literature', imageUrl: 'https://via.placeholder.com/300x200/dc3545/ffffff?text=Books'}
        ];
        updateCategoriesGrid();
    }
}

function updateCategoriesGrid() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (categoriesGrid) {
        categoriesGrid.innerHTML = '';
        
        // Duplicate categories for infinite scroll
        const duplicatedCategories = [...categories, ...categories, ...categories];
        
        duplicatedCategories.forEach(category => {
            categoriesGrid.innerHTML += `
                <div class="auto-carousel-item">
                    <div class="category-card-auto" onclick="filterByCategory(${category.id})">
                        <img src="${category.imageUrl || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(category.name)}" 
                             alt="${category.name}">
                        <div class="category-overlay">
                            <h5>${category.name}</h5>
                            <button class="btn btn-light btn-sm">Shop Now</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Start auto-scroll
        startAutoScroll();
    }
}

let currentCarouselIndex = 0;

function updateCategoryCarousel() {
    const carouselTrack = document.getElementById('categoryCarouselTrack');
    if (!carouselTrack || categories.length === 0) return;
    
    carouselTrack.innerHTML = '';
    currentCarouselIndex = 0;
    
    // Duplicate categories for infinite scroll
    const extendedCategories = [...categories, ...categories, ...categories];
    
    extendedCategories.forEach(category => {
        carouselTrack.innerHTML += `
            <div class="carousel-item-custom">
                <div class="card category-carousel-card shadow border-0 h-100" onclick="filterByCategory(${category.id})" style="cursor: pointer;">
                    <img src="${category.imageUrl || 'https://via.placeholder.com/280x160?text=' + encodeURIComponent(category.name)}" 
                         class="card-img-top" style="height: 140px; object-fit: cover;" alt="${category.name}">
                    <div class="card-body text-center p-2">
                        <h6 class="card-title text-primary mb-1">${category.name}</h6>
                        <p class="card-text text-muted small mb-2">${category.description || ''}</p>
                        <button class="btn btn-primary btn-sm px-3">Shop Now</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    currentCarouselIndex = categories.length;
    updateCarouselPosition();
}

function moveCarousel(direction) {
    if (categories.length === 0) return;
    
    currentCarouselIndex += direction;
    
    const track = document.getElementById('categoryCarouselTrack');
    
    if (currentCarouselIndex >= categories.length * 2) {
        setTimeout(() => {
            track.style.transition = 'none';
            currentCarouselIndex = categories.length;
            updateCarouselPosition();
            setTimeout(() => track.style.transition = 'transform 0.4s ease', 50);
        }, 400);
    } else if (currentCarouselIndex < categories.length) {
        setTimeout(() => {
            track.style.transition = 'none';
            currentCarouselIndex = categories.length * 2 - 1;
            updateCarouselPosition();
            setTimeout(() => track.style.transition = 'transform 0.4s ease', 50);
        }, 400);
    }
    
    updateCarouselPosition();
}

function updateCarouselPosition() {
    const carouselTrack = document.getElementById('categoryCarouselTrack');
    if (!carouselTrack) return;
    
    const itemWidth = 16.666;
    const translateX = -currentCarouselIndex * itemWidth;
    carouselTrack.style.transform = `translateX(${translateX}%)`;
}

// Products Functions
async function loadFeaturedProducts() {
    try {
        const allProducts = await fetchAPI(`${API_BASE_URL}/products`);
        
        const featuredProducts = document.getElementById('featuredProducts');
        if (!featuredProducts) return;
        
        featuredProducts.innerHTML = '';
        allProducts.slice(0, 8).forEach(product => {
            featuredProducts.innerHTML += createProductCard(product);
        });
        
    } catch (error) {
        console.error('Error loading featured products:', error);
        // Show fallback products
        const fallbackProducts = [
            {id: 1, name: 'Smartphone', price: 599.99, stockQuantity: 50, description: 'Latest smartphone', imageUrl: 'https://via.placeholder.com/400x300/007bff/ffffff?text=Smartphone'},
            {id: 2, name: 'Laptop', price: 1299.99, stockQuantity: 25, description: 'High-performance laptop', imageUrl: 'https://via.placeholder.com/400x300/28a745/ffffff?text=Laptop'},
            {id: 3, name: 'T-Shirt', price: 29.99, stockQuantity: 200, description: 'Comfortable t-shirt', imageUrl: 'https://via.placeholder.com/400x300/dc3545/ffffff?text=T-Shirt'}
        ];
        
        const featuredProducts = document.getElementById('featuredProducts');
        if (featuredProducts) {
            featuredProducts.innerHTML = '';
            fallbackProducts.forEach(product => {
                featuredProducts.innerHTML += createProductCard(product);
            });
        }
    }
}

function createProductCard(product) {
    return `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card product-card h-100">
                <img src="${product.imageUrl || 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(product.name)}" 
                     class="card-img-top product-image" alt="${product.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-muted flex-grow-1">${product.description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="h5 text-primary mb-0">$${product.price}</span>
                        <span class="text-muted small">Stock: ${product.stockQuantity}</span>
                    </div>
                    <div class="d-flex gap-2 mt-2">
                        <button class="btn btn-primary flex-grow-1" onclick="addToCart(${product.id})" 
                                ${product.stockQuantity === 0 ? 'disabled' : ''}>
                            ${product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button class="btn btn-outline-danger" onclick="toggleWishlist(${product.id})" title="Add to wishlist">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Search and Filter Functions
let searchTimeout;
let allProducts = [];

async function showSearchSuggestions(query) {
    clearTimeout(searchTimeout);
    
    if (query.length === 0) {
        document.getElementById('searchSuggestions').style.display = 'none';
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        try {
            if (allProducts.length === 0) {
                const response = await fetch(`${API_BASE_URL}/products`);
                if (response.ok) {
                    allProducts = await response.json();
                }
            }
            
            const matches = allProducts
                .filter(product => 
                    product.name.toLowerCase().startsWith(query.toLowerCase())
                )
                .sort((a, b) => a.name.localeCompare(b.name))
                .slice(0, 5);
            
            const suggestionsDiv = document.getElementById('searchSuggestions');
            
            if (matches.length > 0) {
                suggestionsDiv.innerHTML = matches.map(product => `
                    <div class="suggestion-item" onclick="selectSuggestion('${product.name}')">
                        <img src="${product.imageUrl || 'https://via.placeholder.com/40x40?text=' + encodeURIComponent(product.name)}" 
                             alt="${product.name}">
                        <div class="suggestion-content">
                            <div class="suggestion-name">${product.name}</div>
                            <div class="suggestion-price">$${product.price}</div>
                        </div>
                    </div>
                `).join('');
                suggestionsDiv.style.display = 'block';
            } else {
                suggestionsDiv.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    }, 150);
}

function selectSuggestion(productName) {
    document.getElementById('searchInput').value = productName;
    document.getElementById('searchSuggestions').style.display = 'none';
    searchProducts({ preventDefault: () => {} });
}

function searchProducts(event) {
    event.preventDefault();
    document.getElementById('searchSuggestions').style.display = 'none';
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm) {
        window.location.hash = '/products';
        setTimeout(() => {
            document.getElementById('searchInput').value = searchTerm;
            if (typeof applyFilters === 'function') {
                applyFilters();
            } else if (typeof productModule !== 'undefined' && productModule.applyFilters) {
                productModule.applyFilters();
            }
        }, 100);
    }
}

// Hide suggestions when clicking outside
document.addEventListener('click', function(event) {
    const searchContainer = event.target.closest('.position-relative');
    if (!searchContainer) {
        document.getElementById('searchSuggestions').style.display = 'none';
    }
});

function filterByCategory(categoryId) {
    window.location.hash = '/products';
    setTimeout(() => {
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            productModule.showCategoryProducts(categoryId, category.name);
        }
    }, 100);
}

// Cart Functions
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

async function addToCart(productId) {
    // Prevent admin from adding to cart unless impersonating
    if (currentUser && currentUser.role === 'ADMIN' && !isImpersonating) {
        showNotification('Admins cannot place orders. Use impersonation to test ordering.', 'warning');
        return;
    }
    
    // Find product in products array or fetch it
    let product = products.find(p => p.id === productId);
    
    if (!product) {
        // Try to find in productModule products
        product = productModule.products.find(p => p.id === productId);
    }
    
    if (!product) {
        // Fetch product from API
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`);
            if (response.ok) {
                product = await response.json();
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    }
    
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    // Check if item already in cart
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stockQuantity) {
            existingItem.quantity += 1;
            if (currentUser) {
                await saveCartToServer(productId, existingItem.quantity, 'update');
            } else {
                localStorage.setItem('guestCart', JSON.stringify(cart));
            }
            showNotification('Item quantity updated in cart', 'success');
        } else {
            showNotification('Cannot add more items. Stock limit reached.', 'warning');
            return;
        }
    } else {
        cart.push({
            productId: productId,
            name: product.name,
            price: product.price,
            deliveryCharge: product.deliveryCharge || 0,
            imageUrl: product.imageUrl,
            quantity: 1,
            maxStock: product.stockQuantity
        });
        
        if (currentUser) {
            await saveCartToServer(productId, 1, 'add');
        } else {
            localStorage.setItem('guestCart', JSON.stringify(cart));
        }
        showNotification('Item added to cart', 'success');
    }
    
    updateCartCount();
}

// Notification System
function showNotification(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();
    
    const toastHTML = `
        <div id="${toastId}" class="toast toast-${type}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="fas fa-${getIconForType(type)} me-2"></i>
                <strong class="me-auto">${getTypeLabel(type)}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        delay: 2000
    });
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function getIconForType(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getTypeLabel(type) {
    const labels = {
        'success': 'Success',
        'error': 'Error',
        'warning': 'Warning',
        'info': 'Info'
    };
    return labels[type] || 'Notification';
}

// Logout Function
function logout() {
    currentUser = null;
    cart = [];
    localStorage.removeItem('currentUser');
    updateUserInterface();
    updateCartCount();
    window.location.hash = '/home';
    showNotification('Logged out successfully', 'success');
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Image Zoom Functions
function initImageZoom(container, imageUrl) {
    const img = container.querySelector('img');
    const lens = container.querySelector('.zoom-lens');
    
    // Create zoom result window
    const result = document.createElement('div');
    result.className = 'zoom-result';
    result.id = 'zoomResult';
    result.innerHTML = `<img src="${imageUrl}" alt="Zoomed Product">`;
    document.body.appendChild(result);
    
    const resultImg = result.querySelector('img');
    
    // Show lens
    lens.style.display = 'block';
    
    // Add mousemove event
    container.addEventListener('mousemove', function(e) {
        moveLens(e, img, lens, resultImg);
    });
}

function moveLens(e, img, lens, resultImg) {
    const rect = img.getBoundingClientRect();
    let x = e.clientX - rect.left - 40;
    let y = e.clientY - rect.top - 40;
    
    // Keep lens within image bounds
    if (x > img.width - 80) x = img.width - 80;
    if (x < 0) x = 0;
    if (y > img.height - 80) y = img.height - 80;
    if (y < 0) y = 0;
    
    // Position lens
    lens.style.left = x + 'px';
    lens.style.top = y + 'px';
    
    // Calculate zoom position
    const cx = 400 / 80;
    const cy = 400 / 80;
    
    resultImg.style.left = -(x * cx) + 'px';
    resultImg.style.top = -(y * cy) + 'px';
}

function hideImageZoom() {
    const result = document.getElementById('zoomResult');
    if (result) {
        result.remove();
    }
    
    const lenses = document.querySelectorAll('.zoom-lens');
    lenses.forEach(lens => {
        lens.style.display = 'none';
    });
}

// Auto-scroll carousel
let autoScrollInterval;

function startAutoScroll() {
    const track = document.getElementById('categoriesGrid');
    if (!track) return;
    
    let scrollPosition = 0;
    const scrollSpeed = 0.5;
    
    if (autoScrollInterval) clearInterval(autoScrollInterval);
    
    autoScrollInterval = setInterval(() => {
        scrollPosition += scrollSpeed;
        track.style.transform = `translateX(-${scrollPosition}px)`;
        
        // Reset when scrolled through one set
        if (scrollPosition >= track.scrollWidth / 3) {
            scrollPosition = 0;
            track.style.transition = 'none';
            track.style.transform = `translateX(0)`;
            setTimeout(() => {
                track.style.transition = 'transform 0.3s linear';
            }, 50);
        }
    }, 20);
    
    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
    track.addEventListener('mouseleave', () => startAutoScroll());
}