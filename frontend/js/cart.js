// Cart JavaScript

function loadCartPage() {
    const cartPage = document.getElementById('cartPage');
    
    if (cart.length === 0) {
        cartPage.innerHTML = `
            <div class="container mt-5">
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-4x text-muted mb-4"></i>
                    <h3 class="text-muted">Your cart is empty</h3>
                    <p class="text-muted mb-4">Add some products to get started!</p>
                    <button class="btn btn-primary btn-lg" onclick="showProducts()">
                        <i class="fas fa-shopping-bag me-2"></i>Start Shopping
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharges = cart.reduce((sum, item) => sum + (item.deliveryCharge || 0), 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryCharges + tax;
    
    cartPage.innerHTML = `
        <div class="container mt-4">
            <div class="row">
                <div class="col-lg-8">
                    <div class="card shadow-custom">
                        <div class="card-header">
                            <h4><i class="fas fa-shopping-cart me-2"></i>Shopping Cart (${cart.length} items)</h4>
                        </div>
                        <div class="card-body">
                            ${cart.map(item => createCartItemHTML(item)).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-4">
                    <div class="card shadow-custom">
                        <div class="card-header">
                            <h5><i class="fas fa-receipt me-2"></i>Order Summary</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>${formatCurrency(subtotal)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Tax (8%):</span>
                                <span>${formatCurrency(tax)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Delivery Charges:</span>
                                <span>${deliveryCharges > 0 ? formatCurrency(deliveryCharges) : '<span class="text-success">FREE</span>'}</span>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between mb-3">
                                <strong>Total:</strong>
                                <strong class="text-primary">${formatCurrency(total)}</strong>
                            </div>
                            
                            ${currentUser ? `
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary btn-lg" onclick="proceedToCheckout()">
                                        <i class="fas fa-credit-card me-2"></i>Proceed to Checkout
                                    </button>
                                    <button class="btn btn-outline-secondary" onclick="showProducts()">
                                        <i class="fas fa-arrow-left me-2"></i>Continue Shopping
                                    </button>
                                </div>
                            ` : `
                                <div class="alert alert-warning">
                                    <i class="fas fa-exclamation-triangle me-2"></i>
                                    Please <a href="#" onclick="showLogin()" class="alert-link">login</a> to proceed with checkout.
                                </div>
                                <div class="d-grid">
                                    <button class="btn btn-outline-secondary" onclick="showProducts()">
                                        <i class="fas fa-arrow-left me-2"></i>Continue Shopping
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>
                    
                    <!-- Recommended Products -->
                    <div class="card shadow-custom mt-4">
                        <div class="card-header">
                            <h6><i class="fas fa-thumbs-up me-2"></i>You might also like</h6>
                        </div>
                        <div class="card-body">
                            <div id="recommendedProducts">
                                <!-- Recommended products will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadRecommendedProducts();
}

function createCartItemHTML(item) {
    return `
        <div class="cart-item">
            <div class="row align-items-center">
                <div class="col-2">
                    <img src="${item.imageUrl || 'https://via.placeholder.com/80x80?text=' + encodeURIComponent(item.name)}" 
                         class="cart-item-image" alt="${item.name}">
                </div>
                <div class="col-3">
                    <h6 class="mb-1">${item.name}</h6>
                    <p class="text-muted small mb-0">${formatCurrency(item.price)} each</p>
                </div>
                <div class="col-3">
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="updateCartItemQuantity(${item.productId}, ${item.quantity - 1})"
                                ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="form-control text-center" 
                               value="${item.quantity}" min="1" max="${item.maxStock}"
                               onchange="updateCartItemQuantity(${item.productId}, this.value)">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="updateCartItemQuantity(${item.productId}, ${item.quantity + 1})"
                                ${item.quantity >= item.maxStock ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <small class="text-muted">Max: ${item.maxStock}</small>
                </div>
                <div class="col-2 text-end">
                    <strong>${formatCurrency(item.price * item.quantity)}</strong>
                </div>
                <div class="col-2 text-end">
                    <button class="btn btn-outline-danger btn-sm" 
                            onclick="removeFromCart(${item.productId})"
                            title="Remove item">
                        Remove
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function updateCartItemQuantity(productId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.productId === productId);
    if (!item) return;
    
    if (newQuantity > item.maxStock) {
        showNotification(`Cannot add more than ${item.maxStock} items`, 'warning');
        return;
    }
    
    item.quantity = newQuantity;
    
    if (currentUser) {
        await saveCartToServer(productId, newQuantity, 'update');
    } else {
        localStorage.setItem('guestCart', JSON.stringify(cart));
    }
    
    updateCartCount();
    loadCartPage();
}

async function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.productId === productId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        cart.splice(itemIndex, 1);
        
        if (currentUser) {
            await saveCartToServer(productId, 0, 'remove');
        } else {
            localStorage.setItem('guestCart', JSON.stringify(cart));
        }
        
        updateCartCount();
        loadCartPage();
        showNotification(`${item.name} removed from cart`, 'success');
    }
}

async function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Are you sure you want to clear your cart?')) {
        if (currentUser) {
            try {
                await fetch(`${API_BASE_URL}/cart/clear/${currentUser.id}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                console.error('Error clearing cart:', error);
            }
        }
        cart = [];
        updateCartCount();
        loadCartPage();
        showNotification('Cart cleared', 'success');
    }
}

async function loadRecommendedProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const allProducts = await response.json();
        
        // Get random products that are not in cart
        const cartProductIds = cart.map(item => item.productId);
        const availableProducts = allProducts.filter(product => 
            !cartProductIds.includes(product.id) && product.stockQuantity > 0
        );
        
        const recommendedProducts = availableProducts
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        const recommendedContainer = document.getElementById('recommendedProducts');
        if (recommendedContainer && recommendedProducts.length > 0) {
            recommendedContainer.innerHTML = recommendedProducts.map(product => `
                <div class="mb-3">
                    <div class="row align-items-center">
                        <div class="col-4">
                            <img src="${product.imageUrl || 'https://via.placeholder.com/60x60?text=' + encodeURIComponent(product.name)}" 
                                 class="img-fluid rounded" alt="${product.name}">
                        </div>
                        <div class="col-8">
                            <h6 class="mb-1 small">${product.name}</h6>
                            <p class="text-primary small mb-1">${formatCurrency(product.price)}</p>
                            <button class="btn btn-outline-primary btn-sm" onclick="addToCart(${product.id})">
                                <i class="fas fa-plus me-1"></i>Add
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading recommended products:', error);
    }
}

function proceedToCheckout() {
    if (!currentUser) {
        showNotification('Please login to proceed with checkout', 'warning');
        showLogin();
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }
    
    showCheckoutModal();
}

function showCheckoutModal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharges = cart.reduce((sum, item) => sum + (item.deliveryCharge || 0), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryCharges + tax;
    
    const modalHTML = `
        <div class="modal fade" id="checkoutModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-credit-card me-2"></i>Checkout</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="checkoutForm" onsubmit="handleCheckout(event)">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h6 class="mb-0">Shipping Address</h6>
                                        <button type="button" class="btn btn-outline-primary btn-sm" onclick="showAddressManager()">
                                            <i class="fas fa-cog me-1"></i>Manage Addresses
                                        </button>
                                    </div>
                                    <div id="addressSelection">
                                        <!-- Address selection will be loaded here -->
                                    </div>
                                    
                                    <h6 class="mb-3 mt-4">Payment Method</h6>
                                    <div class="form-check mb-2">
                                        <input class="form-check-input" type="radio" name="paymentMethod" 
                                               id="cashOnDelivery" value="CASH_ON_DELIVERY" checked>
                                        <label class="form-check-label" for="cashOnDelivery">
                                            <i class="fas fa-money-bill-wave me-2"></i>Cash on Delivery
                                        </label>
                                    </div>
                                    <div class="form-check mb-2">
                                        <input class="form-check-input" type="radio" name="paymentMethod" 
                                               id="onlinePayment" value="ONLINE_PAYMENT">
                                        <label class="form-check-label" for="onlinePayment">
                                            <i class="fas fa-globe me-2"></i>Online Payment (Demo)
                                        </label>
                                    </div>
                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="radio" name="paymentMethod" 
                                               id="creditCard" value="CREDIT_CARD">
                                        <label class="form-check-label" for="creditCard">
                                            <i class="fas fa-credit-card me-2"></i>Credit/Debit Card (Demo)
                                        </label>
                                    </div>
                                    
                                    <div id="cardDetails" style="display: none;" class="border rounded p-3 mb-3">
                                        <h6 class="mb-3">Card Details</h6>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="form-floating mb-3">
                                                    <input type="text" class="form-control" id="cardNumber" placeholder="Card Number" maxlength="19">
                                                    <label for="cardNumber">Card Number</label>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-floating mb-3">
                                                    <input type="text" class="form-control" id="cardHolder" placeholder="Card Holder Name">
                                                    <label for="cardHolder">Card Holder Name</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="form-floating mb-3">
                                                    <input type="text" class="form-control" id="expiryDate" placeholder="MM/YY" maxlength="5">
                                                    <label for="expiryDate">Expiry Date (MM/YY)</label>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-floating mb-3">
                                                    <input type="text" class="form-control" id="cvv" placeholder="CVV" maxlength="4">
                                                    <label for="cvv">CVV</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="alert alert-info">
                                            <strong>Demo Test Cards:</strong><br>
                                            <small>
                                                Success: 4111 1111 1111 1111<br>
                                                Declined: 4000 0000 0000 0002<br>
                                                Insufficient Funds: 4000 0000 0000 0119
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div id="bundleSection" class="mb-4" style="display: none;">
                                        <h6 class="mb-3">
                                            <i class="fas fa-gift me-2 text-success"></i>Free Bundle Items
                                            <span class="badge bg-success">Eligible!</span>
                                        </h6>
                                        <div class="alert alert-success">
                                            <small>Your order qualifies for <strong id="bundleItemsCount">3</strong> free items!</small>
                                        </div>
                                        <button type="button" class="btn btn-success btn-sm w-100 mb-3" onclick="showBundleModal()">
                                            <i class="fas fa-gift me-2"></i>Select Free Items (<span id="selectedBundleCount">0</span>/<span id="maxBundleCount">3</span>)
                                        </button>
                                        <div id="selectedBundleItems"></div>
                                    </div>
                                    
                                    <h6 class="mb-3">Apply Coupon</h6>
                                    <div class="input-group mb-3">
                                        <input type="text" class="form-control" id="couponCode" placeholder="Enter coupon code">
                                        <button class="btn btn-outline-primary" type="button" onclick="applyCoupon()">
                                            Apply
                                        </button>
                                    </div>
                                    <div id="couponMessage" class="mb-3"></div>
                                    
                                    <h6 class="mb-3">Order Summary</h6>
                                    <div class="border rounded p-3 mb-3" id="orderSummary">
                                        ${cart.map(item => `
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>${item.name} x${item.quantity}</span>
                                                <span>${formatCurrency(item.price * item.quantity)}</span>
                                            </div>
                                        `).join('')}
                                        <hr>
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>Subtotal:</span>
                                            <span id="subtotalAmount">${formatCurrency(subtotal)}</span>
                                        </div>
                                        <div class="d-flex justify-content-between mb-2" id="discountRow" style="display: none;">
                                            <span class="text-success">Discount:</span>
                                            <span class="text-success" id="discountAmount">-${formatCurrency(0)}</span>
                                        </div>
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>Delivery Charges:</span>
                                            <span id="deliveryAmount">${deliveryCharges > 0 ? formatCurrency(deliveryCharges) : 'FREE'}</span>
                                        </div>
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>Tax:</span>
                                            <span id="taxAmount">${formatCurrency(tax)}</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <strong>Total:</strong>
                                            <strong class="text-primary" id="totalAmount">${formatCurrency(total)}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" form="checkoutForm" class="btn btn-primary">
                            <i class="fas fa-check me-2"></i>Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('checkoutModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    modal.show();
    
    // Add payment method change handlers
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const cardDetails = document.getElementById('cardDetails');
            if (this.value === 'CREDIT_CARD') {
                cardDetails.style.display = 'block';
                // Make card fields required
                document.getElementById('cardNumber').required = true;
                document.getElementById('cardHolder').required = true;
                document.getElementById('expiryDate').required = true;
                document.getElementById('cvv').required = true;
            } else {
                cardDetails.style.display = 'none';
                // Remove required from card fields
                document.getElementById('cardNumber').required = false;
                document.getElementById('cardHolder').required = false;
                document.getElementById('expiryDate').required = false;
                document.getElementById('cvv').required = false;
            }
        });
    });
    
    // Add card number formatting
    document.getElementById('cardNumber').addEventListener('input', function() {
        let value = this.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        this.value = formattedValue;
    });
    
    // Add expiry date formatting
    document.getElementById('expiryDate').addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        this.value = value;
    });
    
    // Clean up modal after it's hidden
    document.getElementById('checkoutModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
    
    // Load user addresses
    loadUserAddresses();
    
    // Check bundle eligibility
    checkBundleEligibility();
}

let bundleSettings = null;
let selectedBundleItems = [];

async function checkBundleEligibility() {
    try {
        const response = await fetch(`${API_BASE_URL}/bundle/settings`);
        bundleSettings = await response.json();
        
        if (!bundleSettings.isActive) return;
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (subtotal >= bundleSettings.minOrderAmount) {
            document.getElementById('bundleSection').style.display = 'block';
            document.getElementById('bundleItemsCount').textContent = bundleSettings.freeItemsCount;
            document.getElementById('maxBundleCount').textContent = bundleSettings.freeItemsCount;
        }
    } catch (error) {
        console.error('Error checking bundle eligibility:', error);
    }
}

async function showBundleModal() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();
        
        const modalHTML = `
            <div class="modal fade" id="bundleModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-gift me-2"></i>Select Your Free Bundle Items
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                Select up to <strong>${bundleSettings.freeItemsCount}</strong> items for FREE!
                                Selected: <strong><span id="modalBundleCount">0</span>/${bundleSettings.freeItemsCount}</strong>
                            </div>
                            <div class="row" id="bundleProductsGrid">
                                ${products.filter(p => p.stockQuantity > 0).map(product => `
                                    <div class="col-md-4 mb-3">
                                        <div class="card h-100 ${selectedBundleItems.find(i => i.id === product.id) ? 'border-success' : ''}">
                                            <img src="${product.imageUrl || 'https://via.placeholder.com/200x150?text=' + encodeURIComponent(product.name)}" 
                                                 class="card-img-top" style="height: 150px; object-fit: cover;" alt="${product.name}">
                                            <div class="card-body">
                                                <h6 class="card-title">${product.name}</h6>
                                                <p class="text-muted small mb-2">${formatCurrency(product.price)}</p>
                                                <button class="btn btn-sm w-100 ${selectedBundleItems.find(i => i.id === product.id) ? 'btn-success' : 'btn-outline-success'}" 
                                                        onclick="toggleBundleItem(${product.id}, '${product.name.replace(/'/g, "\\'")}')"
                                                        id="bundleBtn_${product.id}">
                                                    ${selectedBundleItems.find(i => i.id === product.id) ? '<i class="fas fa-check me-1"></i>Selected' : '<i class="fas fa-plus me-1"></i>Select'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-success" onclick="confirmBundleSelection()">
                                <i class="fas fa-check me-2"></i>Confirm Selection
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('bundleModal'));
        modal.show();
        
        document.getElementById('bundleModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    } catch (error) {
        console.error('Error loading bundle products:', error);
        showNotification('Error loading products', 'error');
    }
}

function toggleBundleItem(productId, productName) {
    const index = selectedBundleItems.findIndex(i => i.id === productId);
    
    if (index > -1) {
        selectedBundleItems.splice(index, 1);
    } else {
        if (selectedBundleItems.length >= bundleSettings.freeItemsCount) {
            showNotification(`You can only select ${bundleSettings.freeItemsCount} items`, 'warning');
            return;
        }
        selectedBundleItems.push({ id: productId, name: productName });
    }
    
    const btn = document.getElementById(`bundleBtn_${productId}`);
    const card = btn.closest('.card');
    
    if (index > -1) {
        btn.className = 'btn btn-sm w-100 btn-outline-success';
        btn.innerHTML = '<i class="fas fa-plus me-1"></i>Select';
        card.classList.remove('border-success');
    } else {
        btn.className = 'btn btn-sm w-100 btn-success';
        btn.innerHTML = '<i class="fas fa-check me-1"></i>Selected';
        card.classList.add('border-success');
    }
    
    document.getElementById('modalBundleCount').textContent = selectedBundleItems.length;
}

function confirmBundleSelection() {
    document.getElementById('selectedBundleCount').textContent = selectedBundleItems.length;
    
    const container = document.getElementById('selectedBundleItems');
    container.innerHTML = selectedBundleItems.map(item => `
        <div class="badge bg-success me-2 mb-2">
            <i class="fas fa-gift me-1"></i>${item.name}
        </div>
    `).join('');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('bundleModal'));
    modal.hide();
    
    showNotification(`${selectedBundleItems.length} free items selected!`, 'success');
}

let userAddresses = [];
let selectedAddressId = null;

async function loadUserAddresses() {
    try {
        const response = await fetch(`${API_BASE_URL}/addresses/user/${currentUser.id}`);
        userAddresses = await response.json();
        displayAddressSelection();
    } catch (error) {
        console.error('Error loading addresses:', error);
        userAddresses = [];
        displayAddressSelection();
    }
}

function displayAddressSelection() {
    const container = document.getElementById('addressSelection');
    if (!container) return;
    
    if (userAddresses.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No saved addresses found. <a href="#" onclick="showAddressManager()">Add an address</a>
            </div>
            <div class="form-floating">
                <textarea class="form-control" id="manualAddress" placeholder="Enter address" 
                          required style="height: 100px">${currentUser.address || ''}</textarea>
                <label for="manualAddress">Enter Shipping Address</label>
            </div>
        `;
        return;
    }
    
    // Find default address or use first one
    const defaultAddress = userAddresses.find(addr => addr.isDefault) || userAddresses[0];
    selectedAddressId = defaultAddress.id;
    
    container.innerHTML = `
        <div class="mb-3">
            ${userAddresses.map(address => `
                <div class="form-check mb-2">
                    <input class="form-check-input" type="radio" name="selectedAddress" 
                           id="addr_${address.id}" value="${address.id}" 
                           ${address.id === selectedAddressId ? 'checked' : ''}
                           onchange="selectAddress(${address.id})">
                    <label class="form-check-label" for="addr_${address.id}">
                        <div class="d-flex justify-content-between">
                            <div>
                                <strong>${address.label}</strong>
                                ${address.isDefault ? '<span class="badge bg-primary ms-2">Default</span>' : ''}
                                <br>
                                <small class="text-muted">${address.fullAddress}</small>
                            </div>
                        </div>
                    </label>
                </div>
            `).join('')}
        </div>
        <div class="form-floating">
            <textarea class="form-control" id="selectedAddressText" readonly 
                      style="height: 80px">${defaultAddress.fullAddress}</textarea>
            <label for="selectedAddressText">Selected Address</label>
        </div>
    `;
}

function selectAddress(addressId) {
    selectedAddressId = addressId;
    const address = userAddresses.find(addr => addr.id === addressId);
    if (address) {
        document.getElementById('selectedAddressText').value = address.fullAddress;
    }
}

function showAddressManager() {
    const modalHTML = `
        <div class="modal fade" id="addressManagerModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-map-marker-alt me-2"></i>Manage Addresses</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6>Your Addresses</h6>
                            <button class="btn btn-primary btn-sm" onclick="showAddAddressForm()">
                                <i class="fas fa-plus me-1"></i>Add New Address
                            </button>
                        </div>
                        <div id="addressesList">
                            <!-- Addresses will be loaded here -->
                        </div>
                        
                        <div id="addAddressForm" style="display: none;">
                            <hr>
                            <h6>Add New Address</h6>
                            <form id="newAddressForm" onsubmit="saveNewAddress(event)">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="newAddressLabel" required>
                                            <label>Address Label (e.g., Home, Office)</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="newRecipientName" required>
                                            <label>Recipient Name</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="tel" class="form-control" id="newPhone" required>
                                            <label>Phone Number</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="newPincode" required>
                                            <label>Pincode</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-floating mb-3">
                                    <textarea class="form-control" id="newStreetAddress" required style="height: 80px"></textarea>
                                    <label>Street Address</label>
                                </div>
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="newCity" required>
                                            <label>City</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="newState" required>
                                            <label>State</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="newCountry" value="India" required>
                                            <label>Country</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="setAsDefault">
                                    <label class="form-check-label" for="setAsDefault">
                                        Set as default address
                                    </label>
                                </div>
                                <div class="d-flex gap-2">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save me-1"></i>Save Address
                                    </button>
                                    <button type="button" class="btn btn-secondary" onclick="hideAddAddressForm()">
                                        Cancel
                                    </button>
                                </div>
                            </form>
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
    const modal = new bootstrap.Modal(document.getElementById('addressManagerModal'));
    modal.show();
    
    loadAddressesList();
    
    document.getElementById('addressManagerModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
        loadUserAddresses(); // Refresh addresses in checkout
    });
}

function loadAddressesList() {
    const container = document.getElementById('addressesList');
    if (!container) return;
    
    if (userAddresses.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                <p class="text-muted">No addresses saved yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userAddresses.map(address => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="card-title">
                            ${address.label}
                            ${address.isDefault ? '<span class="badge bg-primary ms-2">Default</span>' : ''}
                        </h6>
                        <p class="card-text">
                            <strong>${address.recipientName}</strong><br>
                            ${address.fullAddress}<br>
                            <small class="text-muted">Phone: ${address.phone}</small>
                        </p>
                    </div>
                    <div class="dropdown">
                        <button class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                                data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu">
                            ${!address.isDefault ? `
                                <li><a class="dropdown-item" href="#" onclick="setDefaultAddress(${address.id})">
                                    <i class="fas fa-star me-2"></i>Set as Default
                                </a></li>
                            ` : ''}
                            <li><a class="dropdown-item" href="#" onclick="editAddress(${address.id})">
                                <i class="fas fa-edit me-2"></i>Edit
                            </a></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="deleteAddress(${address.id})">
                                <i class="fas fa-trash me-2"></i>Delete
                            </a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function showAddAddressForm() {
    document.getElementById('addAddressForm').style.display = 'block';
    document.getElementById('newAddressLabel').focus();
}

function hideAddAddressForm() {
    document.getElementById('addAddressForm').style.display = 'none';
    document.getElementById('newAddressForm').reset();
}

async function saveNewAddress(event) {
    event.preventDefault();
    
    const streetAddress = document.getElementById('newStreetAddress').value;
    const city = document.getElementById('newCity').value;
    const state = document.getElementById('newState').value;
    const pincode = document.getElementById('newPincode').value;
    const country = document.getElementById('newCountry').value;
    
    const addressData = {
        userId: currentUser.id,
        title: document.getElementById('newAddressLabel').value,
        addressLine: `${streetAddress}, ${city}, ${state} - ${pincode}, ${country}`,
        city: city,
        state: state,
        zipCode: pincode,
        phone: document.getElementById('newPhone').value,
        isDefault: document.getElementById('setAsDefault').checked
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/addresses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(addressData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            userAddresses.push(data.address);
            loadAddressesList();
            hideAddAddressForm();
            showNotification('Address saved successfully!', 'success');
        } else {
            showNotification(data.message || 'Failed to save address', 'error');
        }
    } catch (error) {
        console.error('Error saving address:', error);
        showNotification('Failed to save address', 'error');
    }
}

async function setDefaultAddress(addressId) {
    try {
        const response = await fetch(`${API_BASE_URL}/addresses/${addressId}/default`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local data
            userAddresses.forEach(addr => {
                addr.isDefault = addr.id === addressId;
            });
            loadAddressesList();
            showNotification('Default address updated!', 'success');
        } else {
            showNotification(data.message || 'Failed to update default address', 'error');
        }
    } catch (error) {
        console.error('Error setting default address:', error);
        showNotification('Failed to update default address', 'error');
    }
}

async function deleteAddress(addressId) {
    if (!confirm('Are you sure you want to delete this address?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            userAddresses = userAddresses.filter(addr => addr.id !== addressId);
            loadAddressesList();
            showNotification('Address deleted successfully!', 'success');
        } else {
            showNotification(data.message || 'Failed to delete address', 'error');
        }
    } catch (error) {
        console.error('Error deleting address:', error);
        showNotification('Failed to delete address', 'error');
    }
}

let appliedCoupon = null;

async function applyCoupon() {
    const couponCode = document.getElementById('couponCode').value.trim().toUpperCase();
    const messageDiv = document.getElementById('couponMessage');
    
    if (!couponCode) {
        messageDiv.innerHTML = '<div class="alert alert-warning alert-sm">Please enter a coupon code</div>';
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: couponCode,
                orderAmount: subtotal
            })
        });
        
        const data = await response.json();
        
        if (data.valid) {
            appliedCoupon = {
                code: couponCode,
                discountAmount: data.discountAmount,
                coupon: data.coupon
            };
            
            messageDiv.innerHTML = `
                <div class="alert alert-success alert-sm">
                    <i class="fas fa-check-circle me-2"></i>
                    Coupon applied! You saved ${formatCurrency(data.discountAmount)}
                    <button type="button" class="btn-close float-end" onclick="removeCoupon()"></button>
                </div>
            `;
            
            updateOrderSummary();
            document.getElementById('couponCode').disabled = true;
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger alert-sm">${data.message}</div>`;
        }
    } catch (error) {
        console.error('Error applying coupon:', error);
        messageDiv.innerHTML = '<div class="alert alert-danger alert-sm">Error applying coupon</div>';
    }
}

function removeCoupon() {
    appliedCoupon = null;
    document.getElementById('couponCode').value = '';
    document.getElementById('couponCode').disabled = false;
    document.getElementById('couponMessage').innerHTML = '';
    updateOrderSummary();
}

function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharges = cart.reduce((sum, item) => sum + (item.deliveryCharge || 0), 0);
    let discountAmount = 0;
    
    if (appliedCoupon) {
        discountAmount = appliedCoupon.discountAmount;
    }
    
    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * 0.08;
    const total = discountedSubtotal + deliveryCharges + tax;
    
    document.getElementById('subtotalAmount').textContent = formatCurrency(subtotal);
    document.getElementById('deliveryAmount').textContent = deliveryCharges > 0 ? formatCurrency(deliveryCharges) : 'FREE';
    document.getElementById('taxAmount').textContent = formatCurrency(tax);
    document.getElementById('totalAmount').textContent = formatCurrency(total);
    
    const discountRow = document.getElementById('discountRow');
    if (appliedCoupon) {
        discountRow.style.display = 'flex';
        document.getElementById('discountAmount').textContent = '-' + formatCurrency(discountAmount);
    } else {
        discountRow.style.display = 'none';
    }
}

async function handleCheckout(event) {
    event.preventDefault();
    
    let shippingAddress;
    if (selectedAddressId) {
        const selectedAddress = userAddresses.find(addr => addr.id === selectedAddressId);
        shippingAddress = selectedAddress ? selectedAddress.fullAddress : '';
    } else {
        shippingAddress = document.getElementById('manualAddress')?.value || '';
    }
    
    if (!shippingAddress.trim()) {
        showNotification('Please select or enter a shipping address', 'warning');
        return;
    }
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharges = cart.reduce((sum, item) => sum + (item.deliveryCharge || 0), 0);
    let discountAmount = 0;
    let couponCode = null;
    
    if (appliedCoupon) {
        discountAmount = appliedCoupon.discountAmount;
        couponCode = appliedCoupon.code;
    }
    
    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * 0.08;
    const total = discountedSubtotal + deliveryCharges + tax;
    
    // Handle online payments
    if (paymentMethod === 'ONLINE_PAYMENT') {
        const paymentResult = await processOnlinePayment(total);
        if (!paymentResult.success) {
            showNotification(paymentResult.message, 'error');
            return;
        }
    }
    
    // Handle credit card payments
    if (paymentMethod === 'CREDIT_CARD') {
        const cardData = {
            cardNumber: document.getElementById('cardNumber').value.replace(/\s/g, ''),
            cardHolder: document.getElementById('cardHolder').value,
            expiryDate: document.getElementById('expiryDate').value,
            cvv: document.getElementById('cvv').value,
            amount: total
        };
        
        const paymentResult = await processCreditCardPayment(cardData);
        if (!paymentResult.success) {
            showNotification(paymentResult.message, 'error');
            return;
        }
    }
    
    const orderData = {
        userId: currentUser.id,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        originalAmount: subtotal,
        discountAmount: discountAmount,
        couponCode: couponCode,
        totalAmount: total,
        bundleItems: selectedBundleItems.length > 0 ? JSON.stringify(selectedBundleItems) : null,
        items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))
    };
    
    try {
        console.log('Sending order request:', orderData);
        
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Order response:', data);
        
        if (data.success) {
            // Clear cart
            if (currentUser) {
                try {
                    await fetch(`${API_BASE_URL}/cart/clear/${currentUser.id}`, {
                        method: 'DELETE'
                    });
                } catch (error) {
                    console.error('Error clearing cart:', error);
                }
            }
            cart = [];
            updateCartCount();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
            modal.hide();
            
            // Show success message
            const userName = currentUser.firstName || currentUser.username;
            if (isImpersonating) {
                showNotification(`Order placed successfully for ${userName}!`, 'success');
                setTimeout(() => {
                    stopImpersonation();
                }, 1500);
            } else {
                showNotification('Order placed successfully!', 'success');
                setTimeout(() => {
                    showOrders();
                }, 1500);
            }
            
        } else {
            showNotification(data.message || 'Failed to place order', 'error');
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Failed to place order. Please try again.', 'error');
    }
}

async function processOnlinePayment(amount) {
    return new Promise((resolve) => {
        // Show online payment modal
        const modalHTML = `
            <div class="modal fade" id="onlinePaymentModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-globe me-2"></i>Online Payment Gateway</h5>
                        </div>
                        <div class="modal-body text-center">
                            <div class="mb-4">
                                <i class="fas fa-credit-card fa-3x text-primary mb-3"></i>
                                <h4>Payment Amount: ${formatCurrency(amount)}</h4>
                            </div>
                            <div class="row">
                                <div class="col-6">
                                    <button class="btn btn-success w-100" onclick="completeOnlinePayment(true)">
                                        <i class="fas fa-check me-2"></i>Pay Now
                                    </button>
                                </div>
                                <div class="col-6">
                                    <button class="btn btn-danger w-100" onclick="completeOnlinePayment(false)">
                                        <i class="fas fa-times me-2"></i>Cancel
                                    </button>
                                </div>
                            </div>
                            <div class="mt-3">
                                <small class="text-muted">Demo: Click "Pay Now" to simulate successful payment</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('onlinePaymentModal'));
        modal.show();
        
        window.completeOnlinePayment = (success) => {
            modal.hide();
            document.getElementById('onlinePaymentModal').remove();
            delete window.completeOnlinePayment;
            
            if (success) {
                resolve({ success: true, transactionId: 'ONL' + Date.now() });
            } else {
                resolve({ success: false, message: 'Payment cancelled by user' });
            }
        };
    });
}

async function processCreditCardPayment(cardData) {
    try {
        // Show processing overlay
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p class="mt-3">Processing payment...</p>
        `;
        document.body.appendChild(overlay);
        
        const response = await fetch(`${API_BASE_URL}/payments/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cardData)
        });
        
        const result = await response.json();
        overlay.remove();
        
        if (result.success) {
            showNotification('Payment processed successfully!', 'success');
            return { success: true, transactionId: result.transactionId };
        } else {
            return { success: false, message: result.message };
        }
        
    } catch (error) {
        console.error('Payment processing error:', error);
        return { success: false, message: 'Payment processing failed' };
    }
}