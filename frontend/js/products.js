// Products JavaScript

async function loadProducts() {
    await productModule.loadProducts();
}

function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">No products found</h4>
                <p class="text-muted">Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = '';
    productsToShow.forEach(product => {
        productsGrid.innerHTML += createProductCard(product);
    });
}

async function applyFilters() {
    await productModule.applyFilters();
}

function clearFilters() {
    productModule.clearFilters();
}

async function applyFiltersOld() {
    const categoryId = document.getElementById('categoryFilter')?.value || '';
    const minPrice = document.getElementById('minPrice')?.value || '';
    const maxPrice = document.getElementById('maxPrice')?.value || '';
    const searchTerm = document.getElementById('searchInput')?.value || '';
    
    try {
        let url = `${API_BASE_URL}/products/search?page=${currentPage}&size=12`;
        
        if (categoryId) url += `&categoryId=${categoryId}`;
        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
        if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        products = data.content || [];
        totalPages = data.totalPages || 0;
        
        displayProducts(products);
        updateProductCount(data.totalElements || products.length);
        updatePagination();
        
    } catch (error) {
        console.error('Error applying filters:', error);
        showNotification('Error filtering products', 'error');
    }
}

function clearFilters() {
    productModule.clearFilters();
}

function updateProductCount(count) {
    const productCount = document.getElementById('productCount');
    if (productCount) {
        productCount.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
    }
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination || totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `;
    
    // Page numbers
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    
    if (startPage > 0) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(0)">1</a></li>`;
        if (startPage > 1) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i + 1}</a>
            </li>
        `;
    }
    
    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${totalPages - 1})">${totalPages}</a></li>`;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    if (page < 0 || page >= totalPages || page === currentPage) return;
    
    currentPage = page;
    applyFilters();
    
    // Scroll to top of products
    document.getElementById('productsPage').scrollIntoView({ behavior: 'smooth' });
}

// Product Detail Modal
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modalHTML = `
        <div class="modal fade" id="productModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${product.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <img src="${product.imageUrl || 'https://via.placeholder.com/400x400?text=' + encodeURIComponent(product.name)}" 
                                     class="img-fluid rounded" alt="${product.name}">
                                
                                ${product.additionalImages && product.additionalImages.length > 0 ? `
                                    <div class="mt-3">
                                        <div class="row">
                                            ${product.additionalImages.map(img => `
                                                <div class="col-3">
                                                    <img src="${img}" class="img-fluid rounded mb-2" alt="Additional image">
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="col-md-6">
                                <h4 class="text-primary">${formatCurrency(product.price)}</h4>
                                <p class="text-muted mb-3">${product.description || 'No description available'}</p>
                                
                                <div class="mb-3">
                                    <strong>Stock: </strong>
                                    <span class="badge ${product.stockQuantity > 0 ? 'bg-success' : 'bg-danger'}">
                                        ${product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Out of stock'}
                                    </span>
                                </div>
                                
                                <div class="mb-3">
                                    <strong>Category: </strong>
                                    <span class="badge bg-secondary">${product.category?.name || 'Uncategorized'}</span>
                                </div>
                                
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary btn-lg" onclick="addToCart(${product.id})" 
                                            ${product.stockQuantity === 0 ? 'disabled' : ''}>
                                        <i class="fas fa-shopping-cart me-2"></i>
                                        ${product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('productModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
    
    // Clean up modal after it's hidden
    document.getElementById('productModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Update product card to include detail view
function createProductCard(product) {
    return `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card product-card h-100">
                <img src="${product.imageUrl || 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(product.name)}" 
                     class="card-img-top product-image" alt="${product.name}" 
                     onclick="showProductDetail(${product.id})" style="cursor: pointer;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title" onclick="showProductDetail(${product.id})" style="cursor: pointer;">${product.name}</h5>
                    <p class="card-text text-muted flex-grow-1">${(product.description || '').substring(0, 100)}${product.description && product.description.length > 100 ? '...' : ''}</p>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="h5 text-primary mb-0">${formatCurrency(product.price)}</span>
                        <span class="text-muted small">Stock: ${product.stockQuantity}</span>
                    </div>
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary" onclick="addToCart(${product.id})" 
                                ${product.stockQuantity === 0 ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart me-2"></i>
                            ${product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button class="btn btn-outline-primary btn-sm" onclick="showProductDetail(${product.id})">
                            <i class="fas fa-eye me-2"></i>View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}