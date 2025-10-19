// Category Module
class CategoryModule {
    constructor() {
        this.categories = [];
    }

    async loadCategories() {
        try {
            this.categories = await fetchAPI(`${API_BASE_URL}/products/categories`);
            this.updateCategoriesDropdown();
            this.updateCategoriesGrid();
            this.updateCategoryFilter();
        } catch (error) {
            console.error('Error loading categories:', error);
            this.categories = [
                {id: 1, name: 'Electronics', description: 'Electronic devices', imageUrl: 'https://via.placeholder.com/300x200/007bff/ffffff?text=Electronics'},
                {id: 2, name: 'Clothing', description: 'Fashion items', imageUrl: 'https://via.placeholder.com/300x200/28a745/ffffff?text=Clothing'},
                {id: 3, name: 'Books', description: 'Books and literature', imageUrl: 'https://via.placeholder.com/300x200/dc3545/ffffff?text=Books'}
            ];
            this.updateCategoriesGrid();
        }
    }

    updateCategoriesDropdown() {
        const categoriesMenu = document.getElementById('categoriesMenu');
        if (!categoriesMenu) return;

        categoriesMenu.innerHTML = '<li><a class="dropdown-item" href="#" onclick="showProducts()">All Products</a></li>';
        
        this.categories.forEach(category => {
            categoriesMenu.innerHTML += `
                <li><a class="dropdown-item" href="#" onclick="categoryModule.filterByCategory(${category.id})">${category.name}</a></li>
            `;
        });
    }

    updateCategoriesGrid() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (!categoriesGrid) return;
        
        categoriesGrid.innerHTML = '';
        this.categories.slice(0, 6).forEach(category => {
            categoriesGrid.innerHTML += `
                <div class="col-md-4 col-sm-6 mb-4">
                    <div class="card category-card h-100" onclick="categoryModule.filterByCategory(${category.id})">
                        <img src="${category.imageUrl || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(category.name)}" 
                             class="card-img-top category-image" alt="${category.name}">
                        <div class="card-body text-center">
                            <h5 class="card-title">${category.name}</h5>
                            <p class="card-text text-muted">${category.description || ''}</p>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    async updateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        
        // Check if user is admin
        const isAdmin = currentUser && currentUser.role === 'ADMIN';
        
        if (isAdmin) {
            // For admin, fetch product counts for each category
            try {
                const productsResponse = await fetch(`${API_BASE_URL}/products`);
                const allProducts = await productsResponse.json();
                
                this.categories.forEach(category => {
                    // Count only products that have this category and are active
                    const productCount = allProducts.filter(p => 
                        p.category && 
                        p.category.id === category.id && 
                        p.isActive !== false
                    ).length;
                    categoryFilter.innerHTML += `<option value="${category.id}">${category.name} (${productCount})</option>`;
                });
            } catch (error) {
                console.error('Error loading product counts:', error);
                // Fallback to simple display
                this.categories.forEach(category => {
                    categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
                });
            }
        } else {
            // For normal users, just show category names
            this.categories.forEach(category => {
                categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        }
    }

    filterByCategory(categoryId) {
        showProducts();
        setTimeout(() => {
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.value = categoryId;
                productModule.applyFilters();
            }
        }, 100);
    }

    async createCategory(categoryData) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('Category created successfully', 'success');
                await this.loadCategories();
                return true;
            } else {
                showNotification(data.message || 'Failed to create category', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error creating category:', error);
            showNotification('Failed to create category', 'error');
            return false;
        }
    }

    async uploadCategoryImage(file) {
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

    showAddCategoryModal() {
        const modalHTML = `
            <div class="modal fade" id="addCategoryModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-plus me-2"></i>Add New Category</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addCategoryForm" onsubmit="categoryModule.handleAddCategory(event)">
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="categoryName" required>
                                    <label for="categoryName">Category Name</label>
                                </div>
                                <div class="form-floating mb-3">
                                    <textarea class="form-control" id="categoryDescription" style="height: 100px"></textarea>
                                    <label for="categoryDescription">Description</label>
                                </div>
                                <div class="mb-3">
                                    <label for="categoryImageFile" class="form-label">Category Image</label>
                                    <input type="file" class="form-control" id="categoryImageFile" accept="image/*">
                                    <div class="form-text">Upload a category image (JPG, PNG, GIF)</div>
                                </div>
                                <div class="mb-3">
                                    <img id="categoryImagePreview" src="" alt="Preview" class="img-fluid rounded" style="display: none; max-height: 150px;">
                                </div>
                                <div class="mb-3">
                                    <label for="categoryImageUrl" class="form-label">Or Image URL</label>
                                    <input type="url" class="form-control" id="categoryImageUrl" placeholder="https://example.com/image.jpg">
                                </div>
                                <div class="form-floating mb-3">
                                    <input type="number" class="form-control" id="categoryDiscount" min="0" max="100" value="0">
                                    <label for="categoryDiscount">Discount Percentage (%)</label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" form="addCategoryForm" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Add Category
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Image preview handlers
        document.getElementById('categoryImageFile').addEventListener('change', function() {
            const file = this.files[0];
            const preview = document.getElementById('categoryImagePreview');
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
                document.getElementById('categoryImageUrl').value = '';
            }
        });
        
        document.getElementById('categoryImageUrl').addEventListener('input', function() {
            const preview = document.getElementById('categoryImagePreview');
            if (this.value) {
                preview.src = this.value;
                preview.style.display = 'block';
                document.getElementById('categoryImageFile').value = '';
            } else {
                preview.style.display = 'none';
            }
        });
        
        const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
        modal.show();
        
        document.getElementById('addCategoryModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    async handleAddCategory(event) {
        event.preventDefault();
        
        let imageUrl = document.getElementById('categoryImageUrl').value;
        const imageFile = document.getElementById('categoryImageFile').files[0];
        
        // Upload image if file is selected
        if (imageFile) {
            const uploadResult = await this.uploadCategoryImage(imageFile);
            if (uploadResult.success) {
                imageUrl = uploadResult.imageUrl;
            } else {
                showNotification('Failed to upload image: ' + uploadResult.message, 'error');
                return;
            }
        }
        
        const categoryData = {
            userId: currentUser.id,
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value,
            imageUrl: imageUrl,
            discountPercentage: parseInt(document.getElementById('categoryDiscount').value) || 0
        };
        
        const success = await this.createCategory(categoryData);
        if (success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
            modal.hide();
        }
    }

    async editCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) {
            showNotification('Category not found', 'error');
            return;
        }
        
        const modalHTML = `
            <div class="modal fade" id="editCategoryModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-edit me-2"></i>Edit Category</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editCategoryForm" onsubmit="categoryModule.handleEditCategory(event, ${categoryId})">
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="editCategoryName" value="${category.name}" required>
                                    <label for="editCategoryName">Category Name</label>
                                </div>
                                <div class="form-floating mb-3">
                                    <textarea class="form-control" id="editCategoryDescription" style="height: 100px">${category.description || ''}</textarea>
                                    <label for="editCategoryDescription">Description</label>
                                </div>
                                <div class="mb-3">
                                    <label for="editCategoryImageFile" class="form-label">Category Image</label>
                                    <input type="file" class="form-control" id="editCategoryImageFile" accept="image/*">
                                    <div class="form-text">Upload a new category image (JPG, PNG, GIF)</div>
                                </div>
                                <div class="mb-3">
                                    <img id="editCategoryImagePreview" src="${category.imageUrl || ''}" alt="Preview" class="img-fluid rounded" style="${category.imageUrl ? 'display: block;' : 'display: none;'} max-height: 150px;">
                                </div>
                                <div class="mb-3">
                                    <label for="editCategoryImageUrl" class="form-label">Or Image URL</label>
                                    <input type="url" class="form-control" id="editCategoryImageUrl" value="${category.imageUrl || ''}" placeholder="https://example.com/image.jpg">
                                </div>
                                <div class="form-floating mb-3">
                                    <input type="number" class="form-control" id="editCategoryDiscount" min="0" max="100" value="${category.discountPercentage || 0}">
                                    <label for="editCategoryDiscount">Discount Percentage (%)</label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" form="editCategoryForm" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Update Category
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Image preview handlers
        document.getElementById('editCategoryImageFile').addEventListener('change', function() {
            const file = this.files[0];
            const preview = document.getElementById('editCategoryImagePreview');
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
                document.getElementById('editCategoryImageUrl').value = '';
            }
        });
        
        document.getElementById('editCategoryImageUrl').addEventListener('input', function() {
            const preview = document.getElementById('editCategoryImagePreview');
            if (this.value) {
                preview.src = this.value;
                preview.style.display = 'block';
                document.getElementById('editCategoryImageFile').value = '';
            } else {
                preview.style.display = 'none';
            }
        });
        
        const modal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
        modal.show();
        
        document.getElementById('editCategoryModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    async handleEditCategory(event, categoryId) {
        event.preventDefault();
        
        let imageUrl = document.getElementById('editCategoryImageUrl').value;
        const imageFile = document.getElementById('editCategoryImageFile').files[0];
        
        // Upload image if file is selected
        if (imageFile) {
            const uploadResult = await this.uploadCategoryImage(imageFile);
            if (uploadResult.success) {
                imageUrl = uploadResult.imageUrl;
            } else {
                showNotification('Failed to upload image: ' + uploadResult.message, 'error');
                return;
            }
        }
        
        const categoryData = {
            userId: currentUser.id,
            name: document.getElementById('editCategoryName').value,
            description: document.getElementById('editCategoryDescription').value,
            imageUrl: imageUrl,
            discountPercentage: parseInt(document.getElementById('editCategoryDiscount').value) || 0
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/products/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('Category updated successfully', 'success');
                await this.loadCategories();
                loadCategoriesManagement();
                const modal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
                modal.hide();
            } else {
                showNotification(data.message || 'Failed to update category', 'error');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            showNotification('Failed to update category', 'error');
        }
    }

    async deleteCategory(categoryId) {
        if (!confirm('Are you sure you want to delete this category?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/products/categories/${categoryId}?userId=${currentUser.id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('Category deleted successfully', 'success');
                await this.loadCategories();
                loadCategoriesManagement();
            } else {
                showNotification(data.message || 'Failed to delete category', 'error');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            showNotification('Failed to delete category', 'error');
        }
    }
}

const categoryModule = new CategoryModule();