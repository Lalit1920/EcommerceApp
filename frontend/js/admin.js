// Admin JavaScript

async function loadAdminPage() {
    if (!currentUser || currentUser.role !== 'ADMIN') {
        showNotification('Access denied. Admin privileges required.', 'error');
        showHome();
        return;
    }
    
    const adminPage = document.getElementById('adminPage');
    adminPage.innerHTML = `
        <div class="container-fluid mt-4">
            <div class="row">
                <div class="col-md-3">
                    <div class="card shadow-custom">
                        <div class="card-header">
                            <h5><i class="fas fa-cog me-2"></i>Admin Panel</h5>
                        </div>
                        <div class="list-group list-group-flush">
                            <a href="javascript:void(0)" class="list-group-item list-group-item-action active" onclick="showAdminDashboard()">
                                <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                            </a>
                            <a href="javascript:void(0)" class="list-group-item list-group-item-action" onclick="showAdminProducts()">
                                <i class="fas fa-box me-2"></i>Products
                            </a>
                            <a href="javascript:void(0)" class="list-group-item list-group-item-action" onclick="showAdminCategories()">
                                <i class="fas fa-tags me-2"></i>Categories
                            </a>
                            <a href="javascript:void(0)" class="list-group-item list-group-item-action" onclick="showAdminOrders()">
                                <i class="fas fa-shopping-bag me-2"></i>Orders
                            </a>
                            <a href="javascript:void(0)" class="list-group-item list-group-item-action" onclick="showAdminUsers()">
                                <i class="fas fa-users me-2"></i>Users
                            </a>
                            <a href="javascript:void(0)" class="list-group-item list-group-item-action" onclick="showAdminCoupons()">
                                <i class="fas fa-ticket-alt me-2"></i>Coupons
                            </a>
                            <a href="javascript:void(0)" class="list-group-item list-group-item-action" onclick="showAdminBundle()">
                                <i class="fas fa-gift me-2"></i>Bundle Settings
                            </a>
                            <a href="javascript:void(0)" class="list-group-item list-group-item-action" onclick="showAdminReports()">
                                <i class="fas fa-chart-bar me-2"></i>Reports
                            </a>
                            <a href="javascript:void(0)" class="list-group-item list-group-item-action" onclick="showAdminProfile()">
                                <i class="fas fa-user-circle me-2"></i>Profile
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-9">
                    <div id="adminContent">
                        <!-- Admin content will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Set active menu item
    setActiveAdminMenu('Dashboard');
    
    // Load dashboard by default
    showAdminDashboard();
}

function setActiveAdminMenu(activeItem) {
    const menuItems = document.querySelectorAll('.list-group-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.textContent.trim().includes(activeItem)) {
            item.classList.add('active');
        }
    });
}

async function showAdminDashboard() {
    setActiveAdminMenu('Dashboard');
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3><i class="fas fa-tachometer-alt me-2"></i>Dashboard</h3>
            <div class="d-flex align-items-center">
                <div class="position-relative">
                    <img src="${currentUser.profilePicture || 'https://via.placeholder.com/40x40/007bff/ffffff?text=' + (currentUser.firstName ? currentUser.firstName.charAt(0) : currentUser.username.charAt(0))}" 
                         class="rounded-circle me-2" width="40" height="40" alt="Profile" 
                         onclick="showProfilePictureModal()" style="cursor: pointer; border: 2px solid #007bff;" title="Click to change profile picture"
                         onerror="this.src='https://via.placeholder.com/40x40/007bff/ffffff?text=' + (currentUser.firstName ? currentUser.firstName.charAt(0) : currentUser.username.charAt(0))">
                    <i class="fas fa-camera position-absolute" style="bottom: 0; right: 8px; background: #007bff; color: white; border-radius: 50%; padding: 2px; font-size: 10px; cursor: pointer;" onclick="showProfilePictureModal()" title="Change photo"></i>
                </div>
                <span class="text-muted">Welcome back, ${currentUser.firstName || currentUser.username}!</span>
            </div>
        </div>
        
        <div class="row mb-4" id="statsCards">
            <div class="col-12 text-center py-4">
                <div class="loading-spinner"></div>
                <p class="mt-3">Loading dashboard...</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card shadow-custom">
                    <div class="card-header">
                        <h6><i class="fas fa-chart-line me-2"></i>Recent Orders</h6>
                    </div>
                    <div class="card-body" id="recentOrders">
                        <div class="text-center py-3">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card shadow-custom">
                    <div class="card-header">
                        <h6><i class="fas fa-star me-2"></i>Top Products</h6>
                    </div>
                    <div class="card-body" id="topProducts">
                        <div class="text-center py-3">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    await loadDashboardData();
}

async function loadDashboardData() {
    try {
        // Load stats
        const [usersResponse, productsResponse, ordersResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/auth/users`).catch(() => ({ json: () => [] })),
            fetch(`${API_BASE_URL}/products`),
            fetch(`${API_BASE_URL}/orders`)
        ]);
        
        const users = await usersResponse.json().catch(() => []);
        const products = await productsResponse.json();
        const orders = await ordersResponse.json();
        
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Update stats cards
        const statsCards = document.getElementById('statsCards');
        statsCards.innerHTML = `
            <div class="col-md-3 mb-3">
                <div class="stat-card users">
                    <i class="fas fa-users fa-2x mb-2"></i>
                    <h3>${users.length || 0}</h3>
                    <p>Total Users</p>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card products">
                    <i class="fas fa-box fa-2x mb-2"></i>
                    <h3>${products.length}</h3>
                    <p>Total Products</p>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card orders">
                    <i class="fas fa-shopping-bag fa-2x mb-2"></i>
                    <h3>${orders.length}</h3>
                    <p>Total Orders</p>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card revenue">
                    <i class="fas fa-dollar-sign fa-2x mb-2"></i>
                    <h3>${formatCurrency(totalRevenue)}</h3>
                    <p>Total Revenue</p>
                </div>
            </div>
        `;
        
        // Load recent orders
        const recentOrders = document.getElementById('recentOrders');
        const recentOrdersList = orders.slice(0, 5);
        
        if (recentOrdersList.length === 0) {
            recentOrders.innerHTML = '<p class="text-muted text-center">No recent orders</p>';
        } else {
            recentOrders.innerHTML = recentOrdersList.map(order => `
                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <div>
                        <strong>Order #${order.id}</strong>
                        <br>
                        <small class="text-muted">${formatDate(order.orderDate)}</small>
                    </div>
                    <div class="text-end">
                        <span class="badge ${getStatusClass(order.status)}">${order.status}</span>
                        <br>
                        <strong>${formatCurrency(order.totalAmount)}</strong>
                    </div>
                </div>
            `).join('');
        }
        
        // Load top products
        const topProducts = document.getElementById('topProducts');
        const topProductsList = products.slice(0, 5);
        
        if (topProductsList.length === 0) {
            topProducts.innerHTML = '<p class="text-muted text-center">No products available</p>';
        } else {
            topProducts.innerHTML = topProductsList.map(product => `
                <div class="d-flex align-items-center mb-2 pb-2 border-bottom">
                    <img src="${product.imageUrl || 'https://via.placeholder.com/40x40?text=Product'}" 
                         class="rounded me-3" width="40" height="40" alt="${product.name}">
                    <div class="flex-grow-1">
                        <strong>${product.name}</strong>
                        <br>
                        <small class="text-muted">Stock: ${product.stockQuantity}</small>
                    </div>
                    <div class="text-end">
                        <strong>${formatCurrency(product.price)}</strong>
                    </div>
                </div>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

async function showAdminProducts() {
    setActiveAdminMenu('Products');
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3><i class="fas fa-box me-2"></i>Products Management</h3>
            <button class="btn btn-primary" onclick="productModule.showAddProductModal()">
                <i class="fas fa-plus me-2"></i>Add Product
            </button>
        </div>
        
        <div class="card shadow-custom">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="productsTableBody">
                            <tr>
                                <td colspan="7" class="text-center py-4">
                                    <div class="loading-spinner"></div>
                                    <p class="mt-3">Loading products...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    await loadAdminProductsTable();
}

async function loadAdminProductsTable() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();
        
        // Update productModule with latest products
        if (productModule) {
            productModule.products = products;
        }
        
        const tableBody = document.getElementById('productsTableBody');
        
        if (products.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        <i class="fas fa-box fa-2x mb-3"></i>
                        <p>No products found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = products.map(product => `
            <tr>
                <td>
                    <img src="${product.imageUrl || 'https://via.placeholder.com/50x50?text=Product'}" 
                         class="rounded" width="50" height="50" alt="${product.name}">
                </td>
                <td>
                    <strong>${product.name}</strong>
                    <br>
                    <small class="text-muted">${(product.description || '').substring(0, 50)}...</small>
                </td>
                <td>
                    <span class="badge bg-secondary">${product.category?.name || 'Uncategorized'}</span>
                </td>
                <td><strong>${formatCurrency(product.price)}</strong></td>
                <td>
                    <span class="badge ${product.stockQuantity > 0 ? 'bg-success' : 'bg-danger'}">
                        ${product.stockQuantity}
                    </span>
                </td>
                <td>
                    <span class="badge ${product.isActive ? 'bg-success' : 'bg-secondary'}">
                        ${product.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editProduct(${product.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteProduct(${product.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading products:', error);
        const tableBody = document.getElementById('productsTableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-danger">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <p>Error loading products</p>
                </td>
            </tr>
        `;
    }
}

async function showAdminOrders() {
    setActiveAdminMenu('Orders');
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3><i class="fas fa-shopping-bag me-2"></i>Orders Management</h3>
            <div class="btn-group">
                <button class="btn btn-outline-primary active" onclick="filterOrdersByStatus('ALL')">All</button>
                <button class="btn btn-outline-warning" onclick="filterOrdersByStatus('PENDING')">Pending</button>
                <button class="btn btn-outline-info" onclick="filterOrdersByStatus('CONFIRMED')">Confirmed</button>
                <button class="btn btn-outline-primary" onclick="filterOrdersByStatus('SHIPPED')">Shipped</button>
                <button class="btn btn-outline-success" onclick="filterOrdersByStatus('DELIVERED')">Delivered</button>
            </div>
        </div>
        
        <div class="card shadow-custom">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTableBody">
                            <tr>
                                <td colspan="7" class="text-center py-4">
                                    <div class="loading-spinner"></div>
                                    <p class="mt-3">Loading orders...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    await loadAdminOrdersTable();
}

async function loadAdminOrdersTable(statusFilter = 'ALL') {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        const allOrders = await response.json();
        
        const orders = statusFilter === 'ALL' ? allOrders : allOrders.filter(order => order.status === statusFilter);
        
        const tableBody = document.getElementById('ordersTableBody');
        
        if (orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        <i class="fas fa-shopping-bag fa-2x mb-3"></i>
                        <p>No orders found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>
                    <strong>${order.user?.firstName || ''} ${order.user?.lastName || ''}</strong>
                    <br>
                    <small class="text-muted">${order.user?.email || 'N/A'}</small>
                </td>
                <td>
                    <small>${formatDate(order.orderDate)}</small>
                </td>
                <td>
                    <span class="badge bg-info">${order.orderItems?.length || 0} items</span>
                </td>
                <td><strong>${formatCurrency(order.totalAmount)}</strong></td>
                <td>
                    <span class="badge ${getStatusClass(order.status)}">${order.status}</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="showOrderDetails(${order.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" title="Update Status">
                                <i class="fas fa-edit"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="updateOrderStatus(${order.id}, 'PENDING')">Pending</a></li>
                                <li><a class="dropdown-item" href="#" onclick="updateOrderStatus(${order.id}, 'CONFIRMED')">Confirmed</a></li>
                                <li><a class="dropdown-item" href="#" onclick="updateOrderStatus(${order.id}, 'SHIPPED')">Shipped</a></li>
                                <li><a class="dropdown-item" href="#" onclick="updateOrderStatus(${order.id}, 'DELIVERED')">Delivered</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="updateOrderStatus(${order.id}, 'CANCELLED')">Cancelled</a></li>
                            </ul>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading orders:', error);
        const tableBody = document.getElementById('ordersTableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-danger">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <p>Error loading orders</p>
                </td>
            </tr>
        `;
    }
}

function filterOrdersByStatus(status) {
    // Update active button
    const buttons = document.querySelectorAll('.btn-group .btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    loadAdminOrdersTable(status);
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`Order status updated to ${newStatus}`, 'success');
            loadAdminOrdersTable(); // Reload table
        } else {
            showNotification(data.message || 'Failed to update order status', 'error');
        }
        
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Failed to update order status', 'error');
    }
}

async function showAdminCategories() {
    setActiveAdminMenu('Categories');
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3><i class="fas fa-tags me-2"></i>Categories Management</h3>
            <button class="btn btn-primary" onclick="categoryModule.showAddCategoryModal()">
                <i class="fas fa-plus me-2"></i>Add Category
            </button>
        </div>
        
        <div class="row" id="categoriesManagementGrid">
            <!-- Categories will be loaded here -->
        </div>
    `;
    
    await loadCategoriesManagement();
}

async function loadCategoriesManagement() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/categories`);
        const categories = await response.json();
        
        const grid = document.getElementById('categoriesManagementGrid');
        
        if (categories.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-tags fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No categories found</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = categories.map(category => `
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm">
                    <img src="${category.imageUrl || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(category.name)}" 
                         class="card-img-top" style="height: 150px; object-fit: cover;" alt="${category.name}">
                    <div class="card-body">
                        <h5 class="card-title">${category.name}</h5>
                        <p class="card-text text-muted">${category.description || 'No description'}</p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-outline-primary btn-sm" onclick="categoryModule.editCategory(${category.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="categoryModule.deleteCategory(${category.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading categories:', error);
        const grid = document.getElementById('categoriesManagementGrid');
        grid.innerHTML = `
            <div class="col-12 text-center py-4 text-danger">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <p>Error loading categories</p>
            </div>
        `;
    }
}

async function showAdminUsers() {
    setActiveAdminMenu('Users');
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3><i class="fas fa-users me-2"></i>Users Management</h3>
        </div>
        
        <div class="card shadow-custom">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            <tr>
                                <td colspan="7" class="text-center py-4">
                                    <div class="loading-spinner"></div>
                                    <p class="mt-3">Loading users...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    await loadUsersTable();
}

async function loadUsersTable() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/users`);
        const users = await response.json();
        
        const tableBody = document.getElementById('usersTableBody');
        
        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        <i class="fas fa-users fa-2x mb-3"></i>
                        <p>No users found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <img src="${user.profilePicture || 'https://via.placeholder.com/40x40/007bff/ffffff?text=' + (user.firstName ? user.firstName.charAt(0) : user.username.charAt(0))}" 
                         class="rounded-circle" width="40" height="40" alt="${user.firstName || user.username}">
                </td>
                <td>
                    <strong>${user.firstName || ''} ${user.lastName || ''}</strong>
                    <br>
                    <small class="text-muted">${user.phone || 'No phone'}</small>
                </td>
                <td><strong>@${user.username}</strong></td>
                <td>${user.email}</td>
                <td>
                    <span class="badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}">
                        ${user.role}
                    </span>
                </td>
                <td>
                    <small>${formatDate(user.createdAt)}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-info" onclick="viewUserDetails(${user.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="impersonateUser(${user.id})" title="Place Order As User">
                            <i class="fas fa-user-secret"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading users:', error);
        const tableBody = document.getElementById('usersTableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-danger">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <p>Error loading users</p>
                </td>
            </tr>
        `;
    }
}

function viewUserDetails(userId) {
    fetch(`${API_BASE_URL}/auth/user/${userId}`)
        .then(response => response.json())
        .then(user => {
            const modalHTML = `
                <div class="modal fade" id="userDetailsModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title"><i class="fas fa-user me-2"></i>User Details</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-4 text-center">
                                        <img src="${user.profilePicture || 'https://via.placeholder.com/150x150/007bff/ffffff?text=' + (user.firstName ? user.firstName.charAt(0) : user.username.charAt(0))}" 
                                             class="rounded-circle mb-3" width="150" height="150" alt="Profile">
                                        <h5>${user.firstName || ''} ${user.lastName || ''}</h5>
                                        <p class="text-muted">@${user.username}</p>
                                        <span class="badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'} fs-6">${user.role}</span>
                                    </div>
                                    <div class="col-md-8">
                                        <table class="table table-borderless">
                                            <tr>
                                                <th width="30%">Email:</th>
                                                <td>${user.email}</td>
                                            </tr>
                                            <tr>
                                                <th>Phone:</th>
                                                <td>${user.phone || 'Not provided'}</td>
                                            </tr>
                                            <tr>
                                                <th>Address:</th>
                                                <td>${user.address || 'Not provided'}</td>
                                            </tr>
                                            <tr>
                                                <th>Joined:</th>
                                                <td>${formatDate(user.createdAt)}</td>
                                            </tr>
                                            <tr>
                                                <th>Last Updated:</th>
                                                <td>${formatDate(user.updatedAt)}</td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const modal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
            modal.show();
            
            document.getElementById('userDetailsModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        })
        .catch(error => {
            console.error('Error loading user details:', error);
            showNotification('Error loading user details', 'error');
        });
}

function showAdminProfile() {
    setActiveAdminMenu('Profile');
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3><i class="fas fa-user-circle me-2"></i>Admin Profile</h3>
        </div>
        
        <div class="row">
            <div class="col-md-4">
                <div class="card shadow-custom">
                    <div class="card-body text-center">
                        <img src="${currentUser.profilePicture || 'https://via.placeholder.com/150x150/007bff/ffffff?text=' + (currentUser.firstName ? currentUser.firstName.charAt(0) : currentUser.username.charAt(0))}" 
                             class="rounded-circle mb-3" width="150" height="150" alt="Profile Picture" style="border: 3px solid #007bff;"
                             onerror="this.src='https://via.placeholder.com/150x150/007bff/ffffff?text=' + (currentUser.firstName ? currentUser.firstName.charAt(0) : currentUser.username.charAt(0));">
                        <h5>${currentUser.firstName || ''} ${currentUser.lastName || ''}</h5>
                        <p class="text-muted">@${currentUser.username}</p>
                        <p class="text-muted">${currentUser.email}</p>
                        <button class="btn btn-primary" onclick="showProfilePictureModal()">
                            <i class="fas fa-camera me-2"></i>Change Photo
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="col-md-8">
                <div class="card shadow-custom">
                    <div class="card-header">
                        <h6><i class="fas fa-edit me-2"></i>Profile Information</h6>
                    </div>
                    <div class="card-body">
                        <form id="profileForm" onsubmit="handleProfileUpdate(event)">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="firstName" value="${currentUser.firstName || ''}">
                                        <label for="firstName">First Name</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="lastName" value="${currentUser.lastName || ''}">
                                        <label for="lastName">Last Name</label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-floating mb-3">
                                <input type="email" class="form-control" id="email" value="${currentUser.email}" readonly>
                                <label for="email">Email</label>
                            </div>
                            <div class="form-floating mb-3">
                                <input type="text" class="form-control" id="phone" value="${currentUser.phone || ''}">
                                <label for="phone">Phone</label>
                            </div>
                            <div class="form-floating mb-3">
                                <textarea class="form-control" id="address" style="height: 100px">${currentUser.address || ''}</textarea>
                                <label for="address">Address</label>
                            </div>
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-save me-2"></i>Update Profile
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const updatedUser = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/user/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser)
        });
        
        if (response.ok) {
            const updatedUserData = await response.json();
            Object.assign(currentUser, updatedUserData);
            
            // Save updated user to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showNotification('Profile updated successfully', 'success');
            showAdminProfile(); // Refresh the profile view
        } else {
            showNotification('Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile', 'error');
    }
}

async function loadProductsManagement() {
    await loadAdminProductsTable();
}

function showProfilePictureModal() {
    const modalHTML = `
        <div class="modal fade" id="profilePictureModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-user-circle me-2"></i>Update Profile Picture</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="profilePictureForm" onsubmit="handleProfilePictureUpdate(event)">
                            <div class="text-center mb-3">
                                <img id="currentProfilePic" src="${currentUser.profilePicture || 'https://via.placeholder.com/150x150/007bff/ffffff?text=' + (currentUser.firstName ? currentUser.firstName.charAt(0) : currentUser.username.charAt(0))}" 
                                     class="rounded-circle" width="150" height="150" alt="Current Profile">
                            </div>
                            <div class="mb-3">
                                <label for="profilePictureFile" class="form-label">Upload New Picture</label>
                                <input type="file" class="form-control" id="profilePictureFile" accept="image/*">
                                <div class="form-text">Upload a profile picture (JPG, PNG, GIF)</div>
                            </div>
                            <div class="mb-3">
                                <img id="profilePicturePreview" src="" alt="Preview" class="img-fluid rounded-circle mx-auto d-block" style="display: none; max-width: 150px; max-height: 150px;">
                            </div>
                            <div class="mb-3">
                                <label for="profilePictureUrl" class="form-label">Or Image URL</label>
                                <input type="url" class="form-control" id="profilePictureUrl" placeholder="https://example.com/image.jpg">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" form="profilePictureForm" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>Update Picture
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Image preview handlers
    document.getElementById('profilePictureFile').addEventListener('change', function() {
        const file = this.files[0];
        const preview = document.getElementById('profilePicturePreview');
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            document.getElementById('profilePictureUrl').value = '';
        }
    });
    
    document.getElementById('profilePictureUrl').addEventListener('input', function() {
        const preview = document.getElementById('profilePicturePreview');
        if (this.value) {
            preview.src = this.value;
            preview.style.display = 'block';
            document.getElementById('profilePictureFile').value = '';
        } else {
            preview.style.display = 'none';
        }
    });
    
    const modal = new bootstrap.Modal(document.getElementById('profilePictureModal'));
    modal.show();
    
    document.getElementById('profilePictureModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

async function handleProfilePictureUpdate(event) {
    event.preventDefault();
    
    let profilePictureUrl = document.getElementById('profilePictureUrl').value;
    const imageFile = document.getElementById('profilePictureFile').files[0];
    
    // Upload image if file is selected
    if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        try {
            const uploadResponse = await fetch(`${API_BASE_URL}/products/upload-image`, {
                method: 'POST',
                body: formData
            });
            
            const uploadData = await uploadResponse.json();
            if (uploadData.success) {
                profilePictureUrl = uploadData.imageUrl;
            } else {
                showNotification('Failed to upload image: ' + uploadData.message, 'error');
                return;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showNotification('Failed to upload image', 'error');
            return;
        }
    }
    
    if (!profilePictureUrl) {
        showNotification('Please select an image or provide an image URL', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/user/${currentUser.id}/profile-picture`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profilePicture: profilePictureUrl })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update currentUser object
            currentUser.profilePicture = profilePictureUrl;
            
            // Save updated user to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showNotification('Profile picture updated successfully', 'success');
            
            // Update profile pictures in UI
            document.querySelectorAll('img[alt="Profile"], img[alt="Profile Picture"]').forEach(img => {
                img.src = profilePictureUrl;
                img.onerror = function() {
                    this.src = 'https://via.placeholder.com/150x150/007bff/ffffff?text=' + (currentUser.firstName ? currentUser.firstName.charAt(0) : currentUser.username.charAt(0));
                };
            });
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('profilePictureModal'));
            modal.hide();
        } else {
            showNotification(data.message || 'Failed to update profile picture', 'error');
        }
    } catch (error) {
        console.error('Error updating profile picture:', error);
        showNotification('Failed to update profile picture', 'error');
    }
}

async function showAdminBundle() {
    setActiveAdminMenu('Bundle Settings');
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3><i class="fas fa-gift me-2"></i>Bundle Settings</h3>
        </div>
        
        <div class="card shadow-custom">
            <div class="card-body">
                <div id="bundleSettingsForm">
                    <div class="text-center py-4">
                        <div class="loading-spinner"></div>
                        <p class="mt-3">Loading bundle settings...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    await loadBundleSettings();
}

async function loadBundleSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bundle/settings`);
        const settings = await response.json();
        
        const form = document.getElementById('bundleSettingsForm');
        form.innerHTML = `
            <form id="updateBundleForm" onsubmit="handleUpdateBundle(event)">
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-floating mb-3">
                            <input type="number" class="form-control" id="minOrderAmount" 
                                   value="${settings.minOrderAmount}" step="0.01" required>
                            <label for="minOrderAmount">Minimum Order Amount (₹)</label>
                        </div>
                        <div class="form-text mb-3">
                            Orders above this amount will qualify for free bundle items
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-floating mb-3">
                            <input type="number" class="form-control" id="freeItemsCount" 
                                   value="${settings.freeItemsCount}" min="1" max="10" required>
                            <label for="freeItemsCount">Number of Free Items</label>
                        </div>
                        <div class="form-text mb-3">
                            Number of free items customers can select
                        </div>
                    </div>
                </div>
                
                <div class="form-check form-switch mb-4">
                    <input class="form-check-input" type="checkbox" id="isActive" 
                           ${settings.isActive ? 'checked' : ''}>
                    <label class="form-check-label" for="isActive">
                        <strong>Enable Bundle Offer</strong>
                    </label>
                </div>
                
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>How it works:</strong> When a customer's order subtotal exceeds the minimum amount, 
                    they can select the specified number of products as free bundle items. These items will be 
                    marked as "FREE" in their order.
                </div>
                
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-2"></i>Save Settings
                </button>
            </form>
        `;
    } catch (error) {
        console.error('Error loading bundle settings:', error);
        showNotification('Error loading bundle settings', 'error');
    }
}

async function handleUpdateBundle(event) {
    event.preventDefault();
    
    const data = {
        minOrderAmount: document.getElementById('minOrderAmount').value,
        freeItemsCount: document.getElementById('freeItemsCount').value,
        isActive: document.getElementById('isActive').checked
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/bundle/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Bundle settings updated successfully', 'success');
        } else {
            showNotification(result.message || 'Failed to update settings', 'error');
        }
    } catch (error) {
        console.error('Error updating bundle settings:', error);
        showNotification('Failed to update bundle settings', 'error');
    }
}

async function showAdminCoupons() {
    setActiveAdminMenu('Coupons');
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3><i class="fas fa-ticket-alt me-2"></i>Coupons Management</h3>
            <button class="btn btn-primary" onclick="showAddCouponModal()">
                <i class="fas fa-plus me-2"></i>Add Coupon
            </button>
        </div>
        
        <div class="card shadow-custom">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Description</th>
                                <th>Discount</th>
                                <th>Min Order</th>
                                <th>Max Discount</th>
                                <th>Valid Until</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="couponsTableBody">
                            <tr>
                                <td colspan="8" class="text-center py-4">
                                    <div class="loading-spinner"></div>
                                    <p class="mt-3">Loading coupons...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    await loadCouponsTable();
}

async function loadCouponsTable() {
    try {
        const response = await fetch(`${API_BASE_URL}/coupons`);
        const coupons = await response.json();
        
        const tableBody = document.getElementById('couponsTableBody');
        
        if (coupons.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="fas fa-ticket-alt fa-2x mb-3"></i>
                        <p>No coupons found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = coupons.map(coupon => `
            <tr>
                <td><strong>${coupon.code}</strong></td>
                <td>${coupon.description}</td>
                <td><span class="badge bg-success">${coupon.discountPercentage}%</span></td>
                <td>₹${coupon.minOrderAmount}</td>
                <td>₹${coupon.maxDiscountAmount}</td>
                <td>${new Date(coupon.validUntil).toLocaleDateString()}</td>
                <td>
                    <span class="badge ${coupon.isActive ? 'bg-success' : 'bg-secondary'}">
                        ${coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editCoupon(${coupon.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteCoupon(${coupon.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading coupons:', error);
        const tableBody = document.getElementById('couponsTableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-danger">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <p>Error loading coupons</p>
                </td>
            </tr>
        `;
    }
}

function showAddCouponModal() {
    const modalHTML = `
        <div class="modal fade" id="addCouponModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-ticket-alt me-2"></i>Add New Coupon</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addCouponForm" onsubmit="handleAddCoupon(event)">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="couponCode" required>
                                        <label for="couponCode">Coupon Code</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="number" class="form-control" id="discountPercentage" min="1" max="100" required>
                                        <label for="discountPercentage">Discount Percentage</label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-floating mb-3">
                                <textarea class="form-control" id="couponDescription" style="height: 80px" required></textarea>
                                <label for="couponDescription">Description</label>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="number" class="form-control" id="minOrderAmount" min="0" step="0.01" required>
                                        <label for="minOrderAmount">Minimum Order Amount (₹)</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="number" class="form-control" id="maxDiscountAmount" min="0" step="0.01" required>
                                        <label for="maxDiscountAmount">Maximum Discount Amount (₹)</label>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="datetime-local" class="form-control" id="validFrom" required>
                                        <label for="validFrom">Valid From</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="datetime-local" class="form-control" id="validUntil" required>
                                        <label for="validUntil">Valid Until</label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="isActive" checked>
                                <label class="form-check-label" for="isActive">
                                    Active
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" form="addCouponForm" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>Create Coupon
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('addCouponModal'));
    modal.show();
    
    document.getElementById('addCouponModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

async function handleAddCoupon(event) {
    event.preventDefault();
    
    const couponData = {
        code: document.getElementById('couponCode').value.toUpperCase(),
        description: document.getElementById('couponDescription').value,
        discountPercentage: parseFloat(document.getElementById('discountPercentage').value),
        minOrderAmount: parseFloat(document.getElementById('minOrderAmount').value),
        maxDiscountAmount: parseFloat(document.getElementById('maxDiscountAmount').value),
        validFrom: document.getElementById('validFrom').value,
        validUntil: document.getElementById('validUntil').value,
        isActive: document.getElementById('isActive').checked
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/coupons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(couponData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Coupon created successfully', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('addCouponModal'));
            modal.hide();
            loadCouponsTable();
        } else {
            showNotification(data.message || 'Failed to create coupon', 'error');
        }
    } catch (error) {
        console.error('Error creating coupon:', error);
        showNotification('Failed to create coupon', 'error');
    }
}

async function editCoupon(couponId) {
    try {
        const response = await fetch(`${API_BASE_URL}/coupons`);
        const coupons = await response.json();
        const coupon = coupons.find(c => c.id === couponId);
        
        if (!coupon) {
            showNotification('Coupon not found', 'error');
            return;
        }
        
        const modalHTML = `
            <div class="modal fade" id="editCouponModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-edit me-2"></i>Edit Coupon</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editCouponForm" onsubmit="handleEditCoupon(event, ${couponId})">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="editCouponCode" value="${coupon.code}" required>
                                            <label for="editCouponCode">Coupon Code</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="editDiscountPercentage" value="${coupon.discountPercentage}" min="1" max="100" required>
                                            <label for="editDiscountPercentage">Discount Percentage</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-floating mb-3">
                                    <textarea class="form-control" id="editCouponDescription" style="height: 80px" required>${coupon.description}</textarea>
                                    <label for="editCouponDescription">Description</label>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="editMinOrderAmount" value="${coupon.minOrderAmount}" min="0" step="0.01" required>
                                            <label for="editMinOrderAmount">Minimum Order Amount (₹)</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="editMaxDiscountAmount" value="${coupon.maxDiscountAmount}" min="0" step="0.01" required>
                                            <label for="editMaxDiscountAmount">Maximum Discount Amount (₹)</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="datetime-local" class="form-control" id="editValidFrom" value="${new Date(coupon.validFrom).toISOString().slice(0, 16)}" required>
                                            <label for="editValidFrom">Valid From</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="datetime-local" class="form-control" id="editValidUntil" value="${new Date(coupon.validUntil).toISOString().slice(0, 16)}" required>
                                            <label for="editValidUntil">Valid Until</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="editIsActive" ${coupon.isActive ? 'checked' : ''}>
                                    <label class="form-check-label" for="editIsActive">
                                        Active
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" form="editCouponForm" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Update Coupon
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('editCouponModal'));
        modal.show();
        
        document.getElementById('editCouponModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
        
    } catch (error) {
        console.error('Error loading coupon:', error);
        showNotification('Error loading coupon', 'error');
    }
}

async function handleEditCoupon(event, couponId) {
    event.preventDefault();
    
    const couponData = {
        code: document.getElementById('editCouponCode').value.toUpperCase(),
        description: document.getElementById('editCouponDescription').value,
        discountPercentage: parseFloat(document.getElementById('editDiscountPercentage').value),
        minOrderAmount: parseFloat(document.getElementById('editMinOrderAmount').value),
        maxDiscountAmount: parseFloat(document.getElementById('editMaxDiscountAmount').value),
        validFrom: document.getElementById('editValidFrom').value,
        validUntil: document.getElementById('editValidUntil').value,
        isActive: document.getElementById('editIsActive').checked
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/coupons/${couponId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(couponData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Coupon updated successfully', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editCouponModal'));
            modal.hide();
            loadCouponsTable();
        } else {
            showNotification(data.message || 'Failed to update coupon', 'error');
        }
    } catch (error) {
        console.error('Error updating coupon:', error);
        showNotification('Failed to update coupon', 'error');
    }
}

async function deleteCoupon(couponId) {
    if (!confirm('Are you sure you want to delete this coupon?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/coupons/${couponId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Coupon deleted successfully', 'success');
            loadCouponsTable();
        } else {
            showNotification(data.message || 'Failed to delete coupon', 'error');
        }
    } catch (error) {
        console.error('Error deleting coupon:', error);
        showNotification('Failed to delete coupon', 'error');
    }
}

async function showAdminReports() {
    setActiveAdminMenu('Reports');
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3><i class="fas fa-chart-bar me-2"></i>Business Reports</h3>
            <button class="btn btn-danger" onclick="downloadReportPDF()">
                <i class="fas fa-file-pdf me-2"></i>Download PDF Report
            </button>
        </div>
        
        <div class="row mb-4" id="reportStats">
            <div class="col-12 text-center py-4">
                <div class="loading-spinner"></div>
                <p class="mt-3">Loading reports...</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card shadow-custom">
                    <div class="card-header">
                        <h6><i class="fas fa-shopping-bag me-2"></i>Orders Summary</h6>
                    </div>
                    <div class="card-body" id="ordersReport">
                        <div class="text-center py-3">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card shadow-custom">
                    <div class="card-header">
                        <h6><i class="fas fa-dollar-sign me-2"></i>Revenue Analysis</h6>
                    </div>
                    <div class="card-body" id="revenueReport">
                        <div class="text-center py-3">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-12">
                <div class="card shadow-custom">
                    <div class="card-header">
                        <h6><i class="fas fa-list me-2"></i>Detailed Orders Report</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover" id="detailedOrdersTable">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Items</th>
                                        <th>Original Amount</th>
                                        <th>Discount</th>
                                        <th>Final Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody id="detailedOrdersBody">
                                    <tr>
                                        <td colspan="8" class="text-center py-4">
                                            <div class="loading-spinner"></div>
                                            <p class="mt-3">Loading detailed orders...</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    await loadReportsData();
}

async function loadReportsData() {
    try {
        const [ordersResponse, usersResponse, productsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/orders`),
            fetch(`${API_BASE_URL}/auth/users`).catch(() => ({ json: () => [] })),
            fetch(`${API_BASE_URL}/products`)
        ]);
        
        const orders = await ordersResponse.json();
        const users = await usersResponse.json().catch(() => []);
        const products = await productsResponse.json();
        
        // Calculate statistics
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
        const confirmedOrders = orders.filter(o => o.status === 'CONFIRMED').length;
        const shippedOrders = orders.filter(o => o.status === 'SHIPPED').length;
        const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
        const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
        
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const totalDiscount = orders.reduce((sum, order) => sum + (order.discountAmount || 0), 0);
        const originalRevenue = orders.reduce((sum, order) => sum + (order.originalAmount || order.totalAmount || 0), 0);
        
        // Update stats cards
        const reportStats = document.getElementById('reportStats');
        reportStats.innerHTML = `
            <div class="col-md-2 mb-3">
                <div class="stat-card orders">
                    <i class="fas fa-shopping-bag fa-2x mb-2"></i>
                    <h4>${totalOrders}</h4>
                    <p>Total Orders</p>
                </div>
            </div>
            <div class="col-md-2 mb-3">
                <div class="stat-card pending">
                    <i class="fas fa-clock fa-2x mb-2"></i>
                    <h4>${pendingOrders}</h4>
                    <p>Pending</p>
                </div>
            </div>
            <div class="col-md-2 mb-3">
                <div class="stat-card confirmed">
                    <i class="fas fa-check fa-2x mb-2"></i>
                    <h4>${confirmedOrders}</h4>
                    <p>Confirmed</p>
                </div>
            </div>
            <div class="col-md-2 mb-3">
                <div class="stat-card shipped">
                    <i class="fas fa-truck fa-2x mb-2"></i>
                    <h4>${shippedOrders}</h4>
                    <p>Shipped</p>
                </div>
            </div>
            <div class="col-md-2 mb-3">
                <div class="stat-card delivered">
                    <i class="fas fa-check-circle fa-2x mb-2"></i>
                    <h4>${deliveredOrders}</h4>
                    <p>Delivered</p>
                </div>
            </div>
            <div class="col-md-2 mb-3">
                <div class="stat-card cancelled">
                    <i class="fas fa-times-circle fa-2x mb-2"></i>
                    <h4>${cancelledOrders}</h4>
                    <p>Cancelled</p>
                </div>
            </div>
        `;
        
        // Orders summary
        const ordersReport = document.getElementById('ordersReport');
        ordersReport.innerHTML = `
            <div class="mb-3">
                <div class="d-flex justify-content-between mb-2">
                    <span>Total Orders:</span>
                    <strong>${totalOrders}</strong>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-warning">Pending:</span>
                    <span class="text-warning">${pendingOrders}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-info">Confirmed:</span>
                    <span class="text-info">${confirmedOrders}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-primary">Shipped:</span>
                    <span class="text-primary">${shippedOrders}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-success">Delivered:</span>
                    <span class="text-success">${deliveredOrders}</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span class="text-danger">Cancelled:</span>
                    <span class="text-danger">${cancelledOrders}</span>
                </div>
            </div>
            <div class="progress" style="height: 20px;">
                <div class="progress-bar bg-success" style="width: ${(deliveredOrders/totalOrders)*100}%" title="Delivered: ${deliveredOrders}"></div>
                <div class="progress-bar bg-primary" style="width: ${(shippedOrders/totalOrders)*100}%" title="Shipped: ${shippedOrders}"></div>
                <div class="progress-bar bg-info" style="width: ${(confirmedOrders/totalOrders)*100}%" title="Confirmed: ${confirmedOrders}"></div>
                <div class="progress-bar bg-warning" style="width: ${(pendingOrders/totalOrders)*100}%" title="Pending: ${pendingOrders}"></div>
            </div>
        `;
        
        // Revenue analysis
        const revenueReport = document.getElementById('revenueReport');
        revenueReport.innerHTML = `
            <div class="mb-3">
                <div class="d-flex justify-content-between mb-2">
                    <span>Original Revenue:</span>
                    <strong>${formatCurrency(originalRevenue)}</strong>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-danger">Total Discounts:</span>
                    <span class="text-danger">-${formatCurrency(totalDiscount)}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between mb-2">
                    <span>Net Revenue:</span>
                    <strong class="text-success">${formatCurrency(totalRevenue)}</strong>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Average Order Value:</span>
                    <span>${formatCurrency(totalOrders > 0 ? totalRevenue / totalOrders : 0)}</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>Discount Rate:</span>
                    <span>${originalRevenue > 0 ? ((totalDiscount / originalRevenue) * 100).toFixed(1) : 0}%</span>
                </div>
            </div>
        `;
        
        // Detailed orders table
        const detailedOrdersBody = document.getElementById('detailedOrdersBody');
        if (orders.length === 0) {
            detailedOrdersBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="fas fa-shopping-bag fa-2x mb-3"></i>
                        <p>No orders found</p>
                    </td>
                </tr>
            `;
        } else {
            detailedOrdersBody.innerHTML = orders.map(order => `
                <tr>
                    <td><strong>#${order.id}</strong></td>
                    <td>
                        ${order.user?.firstName || ''} ${order.user?.lastName || ''}
                        <br><small class="text-muted">${order.user?.email || 'N/A'}</small>
                    </td>
                    <td><small>${formatDate(order.orderDate)}</small></td>
                    <td><span class="badge bg-info">${order.orderItems?.length || 0}</span></td>
                    <td>${formatCurrency(order.originalAmount || order.totalAmount)}</td>
                    <td class="text-success">${order.discountAmount ? '-' + formatCurrency(order.discountAmount) : '-'}</td>
                    <td><strong>${formatCurrency(order.totalAmount)}</strong></td>
                    <td><span class="badge ${getStatusClass(order.status)}">${order.status}</span></td>
                </tr>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error loading reports data:', error);
        showNotification('Error loading reports data', 'error');
    }
}

function downloadReportPDF() {
    const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>ECommerce Business Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                .stat-item { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .text-success { color: #28a745; }
                .text-danger { color: #dc3545; }
                .text-warning { color: #ffc107; }
                .text-info { color: #17a2b8; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ECommerce Business Report</h1>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            <div id="reportContent"></div>
        </body>
        </html>
    `;
    
    // Get current report data
    const statsCards = document.getElementById('reportStats').innerHTML;
    const ordersTable = document.getElementById('detailedOrdersTable').outerHTML;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.getElementById('reportContent').innerHTML = `
        <div class="stats">${statsCards}</div>
        ${ordersTable}
    `;
    printWindow.document.close();
    printWindow.print();
}

function impersonateUser(userId) {
    fetch(`${API_BASE_URL}/auth/user/${userId}`)
        .then(response => response.json())
        .then(user => {
            if (confirm(`Start placing orders as ${user.firstName || user.username}?`)) {
                originalUser = currentUser;
                currentUser = user;
                isImpersonating = true;
                
                localStorage.setItem('impersonatingUser', JSON.stringify(user));
                localStorage.setItem('originalUser', JSON.stringify(originalUser));
                
                showNotification(`Now placing orders as ${user.firstName || user.username}`, 'info');
                updateUserInterface();
                window.location.hash = '/products';
                updateImpersonationBanner();
            }
        })
        .catch(error => {
            console.error('Error loading user:', error);
            showNotification('Error loading user', 'error');
        });
}

function stopImpersonation() {
    if (originalUser) {
        currentUser = originalUser;
        originalUser = null;
        isImpersonating = false;
        
        localStorage.removeItem('impersonatingUser');
        localStorage.removeItem('originalUser');
        
        showNotification('Stopped impersonation', 'success');
        updateUserInterface();
        updateImpersonationBanner();
        window.location.hash = '/admin';
    }
}

function updateImpersonationBanner() {
    let banner = document.getElementById('impersonationBanner');
    
    if (isImpersonating) {
        if (!banner) {
            const bannerHTML = `
                <div id="impersonationBanner" class="alert alert-warning alert-dismissible fade show position-fixed" 
                     style="top: 70px; left: 50%; transform: translateX(-50%); z-index: 1050; min-width: 400px;">
                    <i class="fas fa-user-secret me-2"></i>
                    <strong>Admin Mode:</strong> Placing orders as <span id="impersonatedUserName">${currentUser.firstName || currentUser.username}</span>
                    <button type="button" class="btn btn-sm btn-outline-dark ms-3" onclick="stopImpersonation()">
                        <i class="fas fa-times me-1"></i>Stop
                    </button>
                </div>
            `;
            document.body.insertAdjacentHTML('afterbegin', bannerHTML);
        } else {
            document.getElementById('impersonatedUserName').textContent = currentUser.firstName || currentUser.username;
        }
    } else {
        if (banner) {
            banner.remove();
        }
    }
}

function initializeImpersonation() {
    const impersonatingUser = localStorage.getItem('impersonatingUser');
    const storedOriginalUser = localStorage.getItem('originalUser');
    
    if (impersonatingUser && storedOriginalUser) {
        originalUser = JSON.parse(storedOriginalUser);
        currentUser = JSON.parse(impersonatingUser);
        isImpersonating = true;
        updateUserInterface();
        updateImpersonationBanner();
    }
}

function editProduct(productId) {
    console.log('editProduct called with ID:', productId);
    if (productModule && typeof productModule.showEditProductModal === 'function') {
        productModule.showEditProductModal(productId);
    } else {
        console.error('productModule or showEditProductModal not available');
        showNotification('Product module not loaded', 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}?userId=${currentUser.id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Product deleted successfully', 'success');
            loadAdminProductsTable(); // Reload table
        } else {
            showNotification(data.message || 'Failed to delete product', 'error');
        }
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', 'error');
    }
}