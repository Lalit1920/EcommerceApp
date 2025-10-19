// Product Module
class ProductModule {
    constructor() {
        this.products = [];
        this.currentPage = 0;
        this.totalPages = 0;
    }

    async loadProducts() {
        // Show category list by default
        this.showCategoryList();
    }
    
    showCategoryList() {
        const categoryView = document.getElementById('categoryListView');
        const productView = document.getElementById('productListView');
        if (categoryView) categoryView.style.display = 'block';
        if (productView) productView.style.display = 'none';
        this.loadCategoryGrid();
    }
    
    showProductList() {
        const categoryView = document.getElementById('categoryListView');
        const productView = document.getElementById('productListView');
        if (categoryView) categoryView.style.display = 'none';
        if (productView) productView.style.display = 'block';
        
        // Update category filter with product counts for admin
        if (typeof categoryModule !== 'undefined') {
            categoryModule.updateCategoryFilter();
        }
    }
    
    async loadCategoryGrid() {
        const categoryGrid = document.getElementById('categoryListGrid');
        if (!categoryGrid) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/products/categories`);
            const categories = await response.json();
            
            categoryGrid.innerHTML = `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="card category-list-card h-100" onclick="productModule.showAllProducts()" style="cursor: pointer;">
                        <div class="card-body text-center">
                            <i class="fas fa-th-large fa-3x text-primary mb-3"></i>
                            <h5 class="card-title">All</h5>
                            <p class="text-muted">View all products</p>
                        </div>
                    </div>
                </div>
                ${categories.map(category => `
                    <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                        <div class="card category-list-card h-100" onclick="productModule.showCategoryProducts(${category.id}, '${category.name}')" style="cursor: pointer;">
                            ${category.discountPercentage > 0 ? `<div class="discount-badge">${category.discountPercentage}% OFF</div>` : ''}
                            <img src="${category.imageUrl || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(category.name)}" 
                                 class="card-img-top" style="height: 200px; object-fit: cover;" alt="${category.name}">
                            <div class="card-body text-center">
                                <h5 class="card-title">${category.name}</h5>
                                <p class="text-muted">${category.description || ''}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            `;
        } catch (error) {
            console.error('Error loading categories:', error);
            categoryGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">Error loading categories</h4>
                </div>
            `;
        }
    }
    
    async showAllProducts() {
        this.showProductList();
        const title = document.getElementById('productListTitle');
        const breadcrumb = document.getElementById('categoryBreadcrumb');
        if (title) title.textContent = 'All Products';
        if (breadcrumb) breadcrumb.textContent = 'All Products';
        
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            this.products = await response.json();
            this.displayProducts(this.products);
            this.updateProductCount(this.products.length);
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = [];
            this.displayProducts(this.products);
            this.updateProductCount(0);
        }
    }
    
    async showCategoryProducts(categoryId, categoryName) {
        this.showProductList();
        const title = document.getElementById('productListTitle');
        const breadcrumb = document.getElementById('categoryBreadcrumb');
        if (title) title.textContent = categoryName;
        if (breadcrumb) breadcrumb.textContent = categoryName;
        
        try {
            const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}`);
            this.products = await response.json();
            this.displayProducts(this.products);
            this.updateProductCount(this.products.length);
        } catch (error) {
            console.error('Error loading category products:', error);
            this.products = [];
            this.displayProducts(this.products);
            this.updateProductCount(0);
        }
    }

    displayProducts(productsToShow) {
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
            productsGrid.innerHTML += this.createProductCard(product);
        });
    }

    createProductCard(product) {
        return `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="card product-card h-100">
                    <div class="product-image-container" onmouseenter="initImageZoom(this, '${product.imageUrl || 'https://via.placeholder.com/400x300/007bff/ffffff?text=' + encodeURIComponent(product.name)}')" onmouseleave="hideImageZoom()">
                        <img src="${product.imageUrl || 'https://via.placeholder.com/400x300/007bff/ffffff?text=' + encodeURIComponent(product.name)}" 
                             class="card-img-top product-image" alt="${product.name}" 
                             onclick="productModule.showProductDetail(${product.id})" style="cursor: pointer;">
                        <div class="zoom-lens" style="display: none;"></div>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title" onclick="productModule.showProductDetail(${product.id})" style="cursor: pointer;">${product.name}</h5>
                        <p class="card-text text-muted flex-grow-1">${(product.description || '').substring(0, 100)}${product.description && product.description.length > 100 ? '...' : ''}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="h5 text-primary mb-0">${formatCurrency(product.price)}</span>
                            <span class="text-muted small">Stock: ${product.stockQuantity}</span>
                        </div>
                        ${product.deliveryCharge && product.deliveryCharge > 0 ? `<div class="text-muted small mb-2"><i class="fas fa-truck me-1"></i>Delivery: ${formatCurrency(product.deliveryCharge)}</div>` : ''}
                        <div class="d-flex gap-2 mb-2">
                            <button class="btn btn-primary flex-grow-1" onclick="addToCart(${product.id})" 
                                    ${product.stockQuantity === 0 ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart me-2"></i>
                                ${product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button class="btn btn-outline-danger" onclick="toggleWishlist(${product.id})" title="Add to wishlist">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                        <button class="btn btn-outline-primary btn-sm w-100" onclick="productModule.showProductDetail(${product.id})">
                            <i class="fas fa-eye me-2"></i>View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const searchInput = document.getElementById('searchInput');
        
        const categoryId = categoryFilter?.value;
        const minPriceValue = minPrice?.value;
        const maxPriceValue = maxPrice?.value;
        const searchTerm = searchInput?.value;
        
        // Update page title and breadcrumb based on selected category
        const title = document.getElementById('productListTitle');
        const breadcrumb = document.getElementById('categoryBreadcrumb');
        
        if (categoryId && categoryId.trim() !== '') {
            const selectedOption = categoryFilter.options[categoryFilter.selectedIndex];
            const categoryName = selectedOption.text.replace(/\s*\(\d+\)\s*$/, ''); // Remove count from name
            if (title) title.textContent = categoryName;
            if (breadcrumb) breadcrumb.textContent = categoryName;
        } else {
            if (title) title.textContent = 'All Products';
            if (breadcrumb) breadcrumb.textContent = 'All Products';
        }
        
        try {
            let products = [];
            
            // If category is selected, get products by category
            if (categoryId && categoryId.trim() !== '') {
                const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}`);
                if (response.ok) {
                    products = await response.json();
                } else {
                    console.error('Failed to fetch products for category:', categoryId);
                    showNotification('Failed to load products for this category', 'error');
                    products = [];
                }
            } else {
                // Get all products
                const response = await fetch(`${API_BASE_URL}/products`);
                if (response.ok) {
                    products = await response.json();
                }
            }
            
            // Apply price range filter
            if (minPriceValue || maxPriceValue) {
                products = products.filter(product => {
                    const price = parseFloat(product.price);
                    const min = minPriceValue ? parseFloat(minPriceValue) : 0;
                    const max = maxPriceValue ? parseFloat(maxPriceValue) : Infinity;
                    return price >= min && price <= max;
                });
            }
            
            // Apply search filter
            if (searchTerm && searchTerm.trim() !== '') {
                const term = searchTerm.toLowerCase();
                products = products.filter(product => 
                    product.name.toLowerCase().includes(term) ||
                    (product.description && product.description.toLowerCase().includes(term))
                );
            }
            
            this.products = products;
            this.displayProducts(this.products);
            this.updateProductCount(this.products.length);
            
        } catch (error) {
            console.error('Error applying filters:', error);
            showNotification('Error filtering products: ' + error.message, 'error');
            this.loadProducts();
        }
    }

    clearFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const searchInput = document.getElementById('searchInput');
        
        if (categoryFilter) categoryFilter.value = '';
        if (minPrice) minPrice.value = '';
        if (maxPrice) maxPrice.value = '';
        if (searchInput) searchInput.value = '';
        
        this.currentPage = 0;
        this.loadProducts();
    }

    updateProductCount(count) {
        const productCount = document.getElementById('productCount');
        if (productCount) {
            productCount.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
        }
    }

    updatePagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination || this.totalPages <= 1) {
            if (pagination) pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 0 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="productModule.changePage(${this.currentPage - 1})">Previous</a>
            </li>
        `;
        
        // Page numbers
        const startPage = Math.max(0, this.currentPage - 2);
        const endPage = Math.min(this.totalPages - 1, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="productModule.changePage(${i})">${i + 1}</a>
                </li>
            `;
        }
        
        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === this.totalPages - 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="productModule.changePage(${this.currentPage + 1})">Next</a>
            </li>
        `;
        
        pagination.innerHTML = paginationHTML;
    }

    changePage(page) {
        if (page < 0 || page >= this.totalPages || page === this.currentPage) return;
        
        this.currentPage = page;
        this.applyFilters();
    }

    async uploadProductImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch(`${API_BASE_URL}/products/upload-image`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error uploading image:', error);
            return { success: false, message: 'Upload failed' };
        }
    }

    showAddProductModal() {
        if (!currentUser || currentUser.role !== 'ADMIN') {
            showNotification('Access denied. Admin privileges required.', 'error');
            return;
        }
        
        const modalHTML = `
            <div class="modal fade" id="addProductModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-plus me-2"></i>Add New Product</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addProductForm" onsubmit="productModule.handleAddProduct(event)">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="productName" required>
                                            <label for="productName">Product Name</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <textarea class="form-control" id="productDescription" style="height: 100px"></textarea>
                                            <label for="productDescription">Description</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="productPrice" step="0.01" required>
                                            <label for="productPrice">Price</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="productStock" required>
                                            <label for="productStock">Stock Quantity</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="productDeliveryCharge" step="0.01" min="0" value="0">
                                            <label for="productDeliveryCharge">Delivery Charge (₹)</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <select class="form-control" id="productCategory" required>
                                                <option value="">Select Category</option>
                                            </select>
                                            <label for="productCategory">Category</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="productImageFile" class="form-label">Product Image</label>
                                            <input type="file" class="form-control" id="productImageFile" accept="image/*">
                                            <div class="form-text">Upload a product image (JPG, PNG, GIF)</div>
                                        </div>
                                        <div class="mb-3">
                                            <img id="productImagePreview" src="" alt="Preview" class="img-fluid rounded" style="display: none; max-height: 200px;">
                                        </div>
                                        <div class="mb-3">
                                            <label for="productImageUrl" class="form-label">Or Image URL</label>
                                            <input type="url" class="form-control" id="productImageUrl" placeholder="https://example.com/image.jpg">
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" form="addProductForm" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Add Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Load categories
        const categorySelect = document.getElementById('productCategory');
        categoryModule.categories.forEach(category => {
            categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
        });
        
        // Image preview handlers
        document.getElementById('productImageFile').addEventListener('change', function() {
            const file = this.files[0];
            const preview = document.getElementById('productImagePreview');
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
                document.getElementById('productImageUrl').value = '';
            }
        });
        
        document.getElementById('productImageUrl').addEventListener('input', function() {
            const preview = document.getElementById('productImagePreview');
            if (this.value) {
                preview.src = this.value;
                preview.style.display = 'block';
                document.getElementById('productImageFile').value = '';
            } else {
                preview.style.display = 'none';
            }
        });
        
        const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
        modal.show();
        
        document.getElementById('addProductModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    async handleAddProduct(event) {
        event.preventDefault();
        
        let imageUrl = document.getElementById('productImageUrl').value;
        const imageFile = document.getElementById('productImageFile').files[0];
        
        // Upload image if file is selected
        if (imageFile) {
            const uploadResult = await this.uploadProductImage(imageFile);
            if (uploadResult.success) {
                imageUrl = uploadResult.imageUrl;
            } else {
                showNotification('Failed to upload image: ' + uploadResult.message, 'error');
                return;
            }
        }
        
        const productData = {
            userId: currentUser.id,
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: document.getElementById('productPrice').value,
            stockQuantity: document.getElementById('productStock').value,
            deliveryCharge: document.getElementById('productDeliveryCharge').value || 0,
            categoryId: document.getElementById('productCategory').value,
            imageUrl: imageUrl
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('Product created successfully', 'success');
                await this.loadProducts();
                loadProductsManagement();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
                modal.hide();
            } else {
                showNotification(data.message || 'Failed to create product', 'error');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            showNotification('Failed to create product', 'error');
        }
    }

    showEditProductModal(productId) {
        if (!currentUser || currentUser.role !== 'ADMIN') {
            showNotification('Access denied. Admin privileges required.', 'error');
            return;
        }
        
        console.log('Opening edit modal for product ID:', productId);
        console.log('Available products:', this.products.map(p => ({ id: p.id, name: p.name })));
        
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found with ID:', productId);
            showNotification('Product not found', 'error');
            return;
        }
        
        console.log('Found product:', product);
        
        const modalHTML = `
            <div class="modal fade" id="editProductModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-edit me-2"></i>Edit Product</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editProductForm" onsubmit="productModule.handleEditProduct(event, ${product.id})">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="editProductName" value="${product.name}" required>
                                            <label for="editProductName">Product Name</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <textarea class="form-control" id="editProductDescription" style="height: 100px">${product.description || ''}</textarea>
                                            <label for="editProductDescription">Description</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="editProductPrice" step="0.01" value="${product.price}" required>
                                            <label for="editProductPrice">Price</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="editProductStock" value="${product.stockQuantity}" required>
                                            <label for="editProductStock">Stock Quantity</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="editProductDeliveryCharge" step="0.01" min="0" value="${product.deliveryCharge || 0}">
                                            <label for="editProductDeliveryCharge">Delivery Charge (₹)</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <select class="form-control" id="editProductCategory" required>
                                                <option value="">Select Category</option>
                                            </select>
                                            <label for="editProductCategory">Category</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Current Image</label>
                                            <img src="${product.imageUrl || 'https://via.placeholder.com/200x200?text=' + encodeURIComponent(product.name)}" 
                                                 class="img-fluid rounded mb-2" style="max-height: 150px;">
                                        </div>
                                        <div class="mb-3">
                                            <label for="editProductImageFile" class="form-label">New Image</label>
                                            <input type="file" class="form-control" id="editProductImageFile" accept="image/*">
                                        </div>
                                        <div class="mb-3">
                                            <img id="editProductImagePreview" src="" alt="Preview" class="img-fluid rounded" style="display: none; max-height: 150px;">
                                        </div>
                                        <div class="mb-3">
                                            <label for="editProductImageUrl" class="form-label">Or Image URL</label>
                                            <input type="url" class="form-control" id="editProductImageUrl" value="${product.imageUrl || ''}">
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" form="editProductForm" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Update Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Load categories and select current
        const categorySelect = document.getElementById('editProductCategory');
        categoryModule.categories.forEach(category => {
            const selected = product.category?.id === category.id ? 'selected' : '';
            categorySelect.innerHTML += `<option value="${category.id}" ${selected}>${category.name}</option>`;
        });
        
        // Image preview handlers
        document.getElementById('editProductImageFile').addEventListener('change', function() {
            const file = this.files[0];
            const preview = document.getElementById('editProductImagePreview');
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
                document.getElementById('editProductImageUrl').value = '';
            }
        });
        
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
        
        document.getElementById('editProductModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    async handleEditProduct(event, productId) {
        event.preventDefault();
        
        try {
            let imageUrl = document.getElementById('editProductImageUrl').value;
            const imageFile = document.getElementById('editProductImageFile').files[0];
            
            // Upload new image if file is selected
            if (imageFile) {
                const uploadResult = await this.uploadProductImage(imageFile);
                if (uploadResult.success) {
                    imageUrl = uploadResult.imageUrl;
                } else {
                    showNotification('Failed to upload image: ' + uploadResult.message, 'error');
                    return;
                }
            }
            
            const productData = {
                userId: currentUser.id,
                name: document.getElementById('editProductName').value.trim(),
                description: document.getElementById('editProductDescription').value.trim(),
                price: parseFloat(document.getElementById('editProductPrice').value),
                stockQuantity: parseInt(document.getElementById('editProductStock').value),
                deliveryCharge: parseFloat(document.getElementById('editProductDeliveryCharge').value) || 0,
                categoryId: document.getElementById('editProductCategory').value,
                imageUrl: imageUrl || ''
            };
            
            // Validate required fields
            if (!productData.name || isNaN(productData.price) || isNaN(productData.stockQuantity)) {
                showNotification('Please fill in all required fields with valid values', 'error');
                return;
            }
            
            if (productData.price <= 0) {
                showNotification('Price must be greater than 0', 'error');
                return;
            }
            
            if (productData.stockQuantity < 0) {
                showNotification('Stock quantity cannot be negative', 'error');
                return;
            }
            
            console.log('Updating product ID:', productId);
            console.log('Product data being sent:', productData);
            
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('HTTP Error:', response.status, errorText);
                showNotification(`Failed to update product (HTTP ${response.status})`, 'error');
                return;
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                showNotification('Product updated successfully', 'success');
                await this.loadProducts();
                if (typeof loadProductsManagement === 'function') {
                    loadProductsManagement();
                }
                const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
                if (modal) {
                    modal.hide();
                }
            } else {
                showNotification(data.message || 'Failed to update product', 'error');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            showNotification('Network error: ' + error.message, 'error');
        }
    }

    showProductDetail(productId) {
        const product = this.products.find(p => p.id === productId);
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
                                    
                                    ${product.deliveryCharge && product.deliveryCharge > 0 ? `
                                    <div class="mb-3">
                                        <strong>Delivery Charge: </strong>
                                        <span class="text-success">${formatCurrency(product.deliveryCharge)}</span>
                                    </div>
                                    ` : ''}
                                    
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
        
        const existingModal = document.getElementById('productModal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
        
        document.getElementById('productModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
}

const productModule = new ProductModule();

function showCategoryList() {
    productModule.showCategoryList();
}

function showAllProducts() {
    productModule.showAllProducts();
}