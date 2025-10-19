// Wishlist JavaScript

let wishlist = [];

async function loadWishlistPage() {
    const wishlistPage = document.getElementById('wishlistPage');
    wishlistPage.innerHTML = `
        <div class="container mt-4">
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h3><i class="fas fa-heart text-danger me-2"></i>My Wishlist</h3>
                        <span class="text-muted" id="wishlistCount">0 items</span>
                    </div>
                    
                    <div id="wishlistContent">
                        <div class="text-center py-5">
                            <div class="loading-spinner"></div>
                            <p class="mt-3">Loading wishlist...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    await loadUserWishlist();
}

async function loadUserWishlist() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/wishlist/${currentUser.id}`);
        if (response.ok) {
            wishlist = await response.json();
            displayWishlist();
        }
    } catch (error) {
        console.error('Error loading wishlist:', error);
        document.getElementById('wishlistContent').innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
                <p class="text-muted">Error loading wishlist</p>
            </div>
        `;
    }
}

function displayWishlist() {
    const wishlistContent = document.getElementById('wishlistContent');
    const wishlistCount = document.getElementById('wishlistCount');
    
    wishlistCount.textContent = `${wishlist.length} item${wishlist.length !== 1 ? 's' : ''}`;
    
    if (wishlist.length === 0) {
        wishlistContent.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-heart fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">Your wishlist is empty</h4>
                <p class="text-muted">Add products you love to your wishlist</p>
                <button class="btn btn-primary" onclick="showProducts()">Browse Products</button>
            </div>
        `;
        return;
    }
    
    wishlistContent.innerHTML = `
        <div class="row">
            ${wishlist.map(item => `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="card product-card h-100">
                        <img src="${item.product.imageUrl || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(item.product.name)}" 
                             class="card-img-top product-image" alt="${item.product.name}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${item.product.name}</h5>
                            <p class="card-text text-muted flex-grow-1">${item.product.description || ''}</p>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="h5 text-primary mb-0">${formatCurrency(item.product.price)}</span>
                                <span class="text-muted small">Stock: ${item.product.stockQuantity}</span>
                            </div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-primary flex-grow-1" onclick="addToCart(${item.product.id})" 
                                        ${item.product.stockQuantity === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-shopping-cart me-2"></i>
                                    ${item.product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                                <button class="btn btn-outline-danger" onclick="removeFromWishlist(${item.product.id})" title="Remove from wishlist">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function toggleWishlist(productId) {
    if (!currentUser) {
        showNotification('Please login to add items to wishlist', 'warning');
        showLogin();
        return;
    }
    
    const isInWishlist = wishlist.some(item => item.product.id === productId);
    
    if (isInWishlist) {
        await removeFromWishlist(productId);
    } else {
        await addToWishlist(productId);
    }
}

async function addToWishlist(productId) {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/wishlist/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.id,
                productId: productId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Added to wishlist', 'success');
            await loadUserWishlist();
        } else {
            showNotification(data.message || 'Failed to add to wishlist', 'error');
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        showNotification('Failed to add to wishlist', 'error');
    }
}

async function removeFromWishlist(productId) {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/wishlist/remove`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.id,
                productId: productId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Removed from wishlist', 'success');
            await loadUserWishlist();
        } else {
            showNotification(data.message || 'Failed to remove from wishlist', 'error');
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        showNotification('Failed to remove from wishlist', 'error');
    }
}