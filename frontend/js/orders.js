// Orders JavaScript

async function loadOrdersPage() {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    const ordersPage = document.getElementById('ordersPage');
    ordersPage.innerHTML = `
        <div class="container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3><i class="fas fa-shopping-bag me-2"></i>My Orders</h3>
                <button class="btn btn-primary" onclick="showProducts()">
                    <i class="fas fa-plus me-2"></i>Continue Shopping
                </button>
            </div>
            
            <div id="ordersContainer">
                <div class="text-center py-5">
                    <div class="loading-spinner"></div>
                    <p class="mt-3">Loading your orders...</p>
                </div>
            </div>
        </div>
    `;
    
    await loadUserOrders();
}

async function loadUserOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/user/${currentUser.id}`);
        const orders = await response.json();
        
        const ordersContainer = document.getElementById('ordersContainer');
        
        if (orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-bag fa-4x text-muted mb-4"></i>
                    <h4 class="text-muted">No orders yet</h4>
                    <p class="text-muted mb-4">Start shopping to see your orders here!</p>
                    <button class="btn btn-primary btn-lg" onclick="showProducts()">
                        <i class="fas fa-shopping-cart me-2"></i>Start Shopping
                    </button>
                </div>
            `;
            return;
        }
        
        ordersContainer.innerHTML = orders.map(order => createOrderCard(order)).join('');
        
    } catch (error) {
        console.error('Error loading orders:', error);
        const ordersContainer = document.getElementById('ordersContainer');
        ordersContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error loading orders. Please try again later.
            </div>
        `;
    }
}

function createOrderCard(order) {
    const statusClass = getStatusClass(order.status);
    const statusIcon = getStatusIcon(order.status);
    
    return `
        <div class="card order-card shadow-custom mb-4">
            <div class="card-header">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <h6 class="mb-0">
                            <i class="fas fa-receipt me-2"></i>
                            Order #${order.id}
                        </h6>
                        <small class="text-muted">Placed on ${formatDate(order.orderDate)}</small>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <span class="badge ${statusClass} order-status">
                            <i class="${statusIcon} me-1"></i>${order.status}
                        </span>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6 class="mb-3">Order Items:</h6>
                        ${order.orderItems ? order.orderItems.map(item => `
                            <div class="d-flex align-items-center mb-2">
                                <img src="${item.product?.imageUrl || 'https://via.placeholder.com/50x50?text=Product'}" 
                                     class="rounded me-3" width="50" height="50" alt="${item.product?.name || 'Product'}">
                                <div class="flex-grow-1">
                                    <h6 class="mb-0">${item.product?.name || 'Product'}</h6>
                                    <small class="text-muted">Quantity: ${item.quantity} × ${formatCurrency(item.price)}</small>
                                </div>
                                <div class="text-end">
                                    <strong>${formatCurrency(item.subtotal)}</strong>
                                </div>
                            </div>
                        `).join('') : '<p class="text-muted">Order items not available</p>'}
                        
                        ${order.bundleItems ? `
                            <div class="mt-3">
                                <div class="alert alert-success">
                                    <strong><i class="fas fa-gift me-2"></i>Free Bundle Items:</strong>
                                    <div class="mt-2">
                                        ${JSON.parse(order.bundleItems).map(item => `
                                            <span class="badge bg-success me-2">${item.name}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="mt-3">
                            <strong>Shipping Address:</strong>
                            <p class="text-muted mb-0">${order.shippingAddress}</p>
                        </div>
                        
                        <div class="mt-2">
                            <strong>Payment Method:</strong>
                            <span class="badge ${getPaymentMethodClass(order.paymentMethod)} ms-2">
                                <i class="${getPaymentMethodIcon(order.paymentMethod)} me-1"></i>
                                ${getPaymentMethodLabel(order.paymentMethod)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="border rounded p-3">
                            <h6 class="mb-3">Order Summary</h6>
                            ${order.originalAmount ? `
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span>${formatCurrency(order.originalAmount)}</span>
                                </div>
                            ` : ''}
                            ${order.couponCode ? `
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="text-success">Discount (${order.couponCode}):</span>
                                    <span class="text-success">-${formatCurrency(order.discountAmount || 0)}</span>
                                </div>
                            ` : ''}
                            ${order.totalDeliveryCharges && order.totalDeliveryCharges > 0 ? `
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Delivery Charges:</span>
                                    <span>${formatCurrency(order.totalDeliveryCharges)}</span>
                                </div>
                            ` : ''}
                            <hr>
                            <div class="d-flex justify-content-between mb-2">
                                <strong>Total Amount:</strong>
                                <strong class="text-primary">${formatCurrency(order.totalAmount)}</strong>
                            </div>
                            
                            <div class="mt-3 d-grid gap-2">
                                <button class="btn btn-outline-primary btn-sm" onclick="showOrderDetails(${order.id})">
                                    <i class="fas fa-eye me-2"></i>View Details
                                </button>
                                
                                ${order.status === 'PENDING' ? `
                                    <button class="btn btn-outline-danger btn-sm" onclick="cancelOrder(${order.id})">
                                        <i class="fas fa-times me-2"></i>Cancel Order
                                    </button>
                                ` : ''}
                                
                                ${order.status === 'DELIVERED' ? `
                                    <button class="btn btn-outline-success btn-sm" onclick="reorderItems(${order.id})">
                                        <i class="fas fa-redo me-2"></i>Reorder
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getStatusClass(status) {
    const statusClasses = {
        'PENDING': 'bg-warning',
        'CONFIRMED': 'bg-info',
        'SHIPPED': 'bg-primary',
        'DELIVERED': 'bg-success',
        'CANCELLED': 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
}

function getStatusIcon(status) {
    const statusIcons = {
        'PENDING': 'fas fa-clock',
        'CONFIRMED': 'fas fa-check',
        'SHIPPED': 'fas fa-truck',
        'DELIVERED': 'fas fa-check-circle',
        'CANCELLED': 'fas fa-times-circle'
    };
    return statusIcons[status] || 'fas fa-info-circle';
}

async function showOrderDetails(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        const order = await response.json();
        
        const modalHTML = `
            <div class="modal fade" id="orderDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-receipt me-2"></i>Order #${order.id} Details
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <h6>Order Information</h6>
                                    <p><strong>Order Date:</strong> ${formatDate(order.orderDate)}</p>
                                    <p><strong>Status:</strong> 
                                        <span class="badge ${getStatusClass(order.status)}">
                                            <i class="${getStatusIcon(order.status)} me-1"></i>${order.status}
                                        </span>
                                    </p>
                                    <p><strong>Payment Method:</strong> ${getPaymentMethodLabel(order.paymentMethod)}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Shipping Information</h6>
                                    <p><strong>Address:</strong></p>
                                    <p class="text-muted">${order.shippingAddress}</p>
                                </div>
                            </div>
                            
                            ${order.bundleItems ? `
                                <div class="alert alert-success mb-4">
                                    <h6><i class="fas fa-gift me-2"></i>Free Bundle Items</h6>
                                    <div class="mt-2">
                                        ${JSON.parse(order.bundleItems).map(item => `
                                            <span class="badge bg-success me-2 mb-2">
                                                <i class="fas fa-gift me-1"></i>${item.name}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <h6>Order Items</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.orderItems ? order.orderItems.map(item => `
                                            <tr>
                                                <td>
                                                    <div class="d-flex align-items-center">
                                                        <img src="${item.product?.imageUrl || 'https://via.placeholder.com/40x40?text=Product'}" 
                                                             class="rounded me-2" width="40" height="40" alt="${item.product?.name || 'Product'}">
                                                        <span>${item.product?.name || 'Product'}</span>
                                                    </div>
                                                </td>
                                                <td>${formatCurrency(item.price)}</td>
                                                <td>${item.quantity}</td>
                                                <td>${formatCurrency(item.subtotal)}</td>
                                            </tr>
                                        `).join('') : '<tr><td colspan="4" class="text-center text-muted">No items found</td></tr>'}
                                    </tbody>
                                    <tfoot>
                                        ${order.originalAmount ? `
                                            <tr>
                                                <th colspan="3">Subtotal:</th>
                                                <th>${formatCurrency(order.originalAmount)}</th>
                                            </tr>
                                        ` : ''}
                                        ${order.couponCode ? `
                                            <tr class="text-success">
                                                <th colspan="3">Discount (${order.couponCode}):</th>
                                                <th>-${formatCurrency(order.discountAmount || 0)}</th>
                                            </tr>
                                        ` : ''}
                                        ${order.totalDeliveryCharges && order.totalDeliveryCharges > 0 ? `
                                            <tr>
                                                <th colspan="3">Delivery Charges:</th>
                                                <th>${formatCurrency(order.totalDeliveryCharges)}</th>
                                            </tr>
                                        ` : ''}
                                        <tr>
                                            <th colspan="3">Total Amount:</th>
                                            <th class="text-primary">${formatCurrency(order.totalAmount)}</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            <div class="mt-4">
                                <h6>Order Timeline</h6>
                                <div class="timeline">
                                    ${createOrderTimeline(order)}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            ${order.status === 'PENDING' ? `
                                <button type="button" class="btn btn-danger" onclick="cancelOrder(${order.id})">
                                    <i class="fas fa-times me-2"></i>Cancel Order
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('orderDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
        
        // Clean up modal after it's hidden
        document.getElementById('orderDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
        
    } catch (error) {
        console.error('Error loading order details:', error);
        showNotification('Error loading order details', 'error');
    }
}

function createOrderTimeline(order) {
    const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    const currentStatusIndex = statuses.indexOf(order.status);
    
    return statuses.map((status, index) => {
        const isCompleted = index <= currentStatusIndex;
        const isCurrent = index === currentStatusIndex;
        const statusClass = isCompleted ? 'text-success' : 'text-muted';
        const iconClass = isCompleted ? 'fas fa-check-circle' : 'far fa-circle';
        
        return `
            <div class="d-flex align-items-center mb-2">
                <i class="${iconClass} ${statusClass} me-3"></i>
                <span class="${statusClass} ${isCurrent ? 'fw-bold' : ''}">${status}</span>
                ${isCurrent ? '<span class="badge bg-primary ms-2">Current</span>' : ''}
            </div>
        `;
    }).join('');
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'CANCELLED' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Order cancelled successfully', 'success');
            loadUserOrders(); // Reload orders
            
            // Close modal if open
            const modal = document.getElementById('orderDetailsModal');
            if (modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        } else {
            showNotification(data.message || 'Failed to cancel order', 'error');
        }
        
    } catch (error) {
        console.error('Error cancelling order:', error);
        showNotification('Failed to cancel order', 'error');
    }
}

async function reorderItems(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        const order = await response.json();
        
        if (order.orderItems && order.orderItems.length > 0) {
            // Add items to cart
            let addedItems = 0;
            
            for (const item of order.orderItems) {
                if (item.product && item.product.stockQuantity > 0) {
                    const existingCartItem = cart.find(cartItem => cartItem.productId === item.product.id);
                    
                    if (existingCartItem) {
                        const newQuantity = Math.min(
                            existingCartItem.quantity + item.quantity,
                            item.product.stockQuantity
                        );
                        existingCartItem.quantity = newQuantity;
                    } else {
                        cart.push({
                            productId: item.product.id,
                            name: item.product.name,
                            price: item.product.price,
                            imageUrl: item.product.imageUrl,
                            quantity: Math.min(item.quantity, item.product.stockQuantity),
                            maxStock: item.product.stockQuantity
                        });
                    }
                    addedItems++;
                }
            }
            
            if (addedItems > 0) {
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                showNotification(`${addedItems} items added to cart`, 'success');
                showCart();
            } else {
                showNotification('No items could be added (out of stock)', 'warning');
            }
        }
        
    } catch (error) {
        console.error('Error reordering items:', error);
        showNotification('Failed to reorder items', 'error');
    }
}

function getPaymentMethodLabel(paymentMethod) {
    const labels = {
        'CASH_ON_DELIVERY': 'Cash on Delivery',
        'ONLINE_PAYMENT': 'Online Payment',
        'CREDIT_CARD': 'Credit/Debit Card'
    };
    return labels[paymentMethod] || 'Cash on Delivery';
}

function getPaymentMethodIcon(paymentMethod) {
    const icons = {
        'CASH_ON_DELIVERY': 'fas fa-money-bill-wave',
        'ONLINE_PAYMENT': 'fas fa-globe',
        'CREDIT_CARD': 'fas fa-credit-card'
    };
    return icons[paymentMethod] || 'fas fa-money-bill-wave';
}

function getPaymentMethodClass(paymentMethod) {
    const classes = {
        'CASH_ON_DELIVERY': 'bg-warning',
        'ONLINE_PAYMENT': 'bg-success',
        'CREDIT_CARD': 'bg-primary'
    };
    return classes[paymentMethod] || 'bg-info';
}