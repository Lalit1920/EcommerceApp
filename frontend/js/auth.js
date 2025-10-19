// Authentication JavaScript

function loadLoginPage() {
    const loginPage = document.getElementById('loginPage');
    loginPage.innerHTML = `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-4">
                    <div class="card shadow-custom border-radius-custom">
                        <div class="card-body p-4">
                            <div class="text-center mb-4">
                                <i class="fas fa-user-circle fa-3x text-primary mb-3"></i>
                                <h3 class="text-gradient">Login</h3>
                                <p class="text-muted">Welcome back! Please login to your account.</p>
                            </div>
                            
                            <form id="loginForm" onsubmit="handleLogin(event)">
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="loginUsername" placeholder="Username" required>
                                    <label for="loginUsername">Username</label>
                                </div>
                                
                                <div class="form-floating mb-3">
                                    <input type="password" class="form-control" id="loginPassword" placeholder="Password" required>
                                    <label for="loginPassword">Password</label>
                                </div>
                                
                                <button type="submit" class="btn btn-primary w-100 mb-3" id="loginBtn">
                                    <span id="loginSpinner" class="loading-spinner" style="display: none;"></span>
                                    Login
                                </button>
                            </form>
                            
                            <div class="text-center">
                                <p class="mb-2">Don't have an account? 
                                    <a href="#" onclick="showRegister()" class="text-primary">Register here</a>
                                </p>
                                <p class="mb-0">
                                    <a href="#" onclick="showForgotPassword()" class="text-muted small">Forgot Password?</a>
                                </p>
                            </div>
                            
                            <hr class="my-4">
                            
                            <div class="text-center">
                                <h6 class="text-muted mb-3">Demo Accounts</h6>
                                <div class="row">
                                    <div class="col-6">
                                        <button class="btn btn-outline-primary btn-sm w-100" onclick="fillDemoUser()">
                                            Demo User
                                        </button>
                                    </div>
                                    <div class="col-6">
                                        <button class="btn btn-outline-success btn-sm w-100" onclick="fillDemoAdmin()">
                                            Demo Admin
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadRegisterPage() {
    const registerPage = document.getElementById('registerPage');
    registerPage.innerHTML = `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="card shadow-custom border-radius-custom">
                        <div class="card-body p-4">
                            <div class="text-center mb-4">
                                <i class="fas fa-user-plus fa-3x text-primary mb-3"></i>
                                <h3 class="text-gradient">Register</h3>
                                <p class="text-muted">Create your account to start shopping!</p>
                            </div>
                            
                            <form id="registerForm" onsubmit="handleRegister(event)">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="registerFirstName" placeholder="First Name" required>
                                            <label for="registerFirstName">First Name</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="registerLastName" placeholder="Last Name" required>
                                            <label for="registerLastName">Last Name</label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="registerUsername" placeholder="Username" required>
                                    <label for="registerUsername">Username</label>
                                </div>
                                
                                <div class="form-floating mb-3">
                                    <input type="email" class="form-control" id="registerEmail" placeholder="Email" required 
                                           onblur="checkEmailExists(this.value)">
                                    <label for="registerEmail">Email</label>
                                    <div id="emailFeedback" class="mt-2" style="display: none;"></div>
                                </div>
                                
                                <div class="form-floating mb-3">
                                    <input type="password" class="form-control" id="registerPassword" placeholder="Password" required minlength="6">
                                    <label for="registerPassword">Password</label>
                                </div>
                                
                                <div class="form-floating mb-3">
                                    <input type="password" class="form-control" id="confirmPassword" placeholder="Confirm Password" required>
                                    <label for="confirmPassword">Confirm Password</label>
                                </div>
                                
                                <div class="form-floating mb-3">
                                    <input type="tel" class="form-control" id="registerPhone" placeholder="Phone">
                                    <label for="registerPhone">Phone (Optional)</label>
                                </div>
                                
                                <div class="form-floating mb-3">
                                    <textarea class="form-control" id="registerAddress" placeholder="Address" style="height: 100px"></textarea>
                                    <label for="registerAddress">Address (Optional)</label>
                                </div>
                                
                                <button type="submit" class="btn btn-primary w-100 mb-3" id="registerBtn">
                                    <span id="registerSpinner" class="loading-spinner" style="display: none;"></span>
                                    Register
                                </button>
                            </form>
                            
                            <div class="text-center">
                                <p class="mb-0">Already have an account? 
                                    <a href="#" onclick="showLogin()" class="text-primary">Login here</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    const spinner = document.getElementById('loginSpinner');
    
    // Show loading state
    loginBtn.disabled = true;
    spinner.style.display = 'inline-block';
    
    try {
        const data = await fetchAPI(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (data && data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            loadUserCart();
            updateUserInterface();
            updateCartCount();
            showNotification('Login successful!', 'success');
            showHome();
        } else {
            showNotification(data?.message || 'Invalid username or password', 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        if (error.message.includes('400')) {
            showNotification('Invalid username or password', 'error');
        } else {
            showNotification('Login failed. Please try again.', 'error');
        }
    } finally {
        // Hide loading state
        loginBtn.disabled = false;
        spinner.style.display = 'none';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('registerPhone').value;
    const address = document.getElementById('registerAddress').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    const registerBtn = document.getElementById('registerBtn');
    const spinner = document.getElementById('registerSpinner');
    
    // Show loading state
    registerBtn.disabled = true;
    spinner.style.display = 'inline-block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName,
                lastName,
                username,
                email,
                password,
                phone,
                address
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Registration successful! Please login.', 'success');
            showLogin();
        } else {
            // Check if it's an email already exists error
            if (data.message && data.message.toLowerCase().includes('email already exists')) {
                showEmailExistsError(email);
            } else {
                showNotification(data.message || 'Registration failed', 'error');
            }
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    } finally {
        // Hide loading state
        registerBtn.disabled = false;
        spinner.style.display = 'none';
    }
}

function fillDemoUser() {
    document.getElementById('loginUsername').value = 'john_doe';
    document.getElementById('loginPassword').value = 'password';
}

function fillDemoAdmin() {
    document.getElementById('loginUsername').value = 'admin';
    document.getElementById('loginPassword').value = 'password';
}

function loadProfilePage() {
    const profilePage = document.getElementById('profilePage');
    profilePage.innerHTML = `
        <div class="container mt-4">
            <div class="row">
                <div class="col-md-3">
                    <div class="card shadow-custom">
                        <div class="card-body text-center">
                            <div class="position-relative d-inline-block">
                                <img src="${currentUser.profilePicture || 'https://via.placeholder.com/120x120?text=' + (currentUser.firstName?.charAt(0) || currentUser.username.charAt(0))}" 
                                     class="profile-avatar mb-3" alt="Profile" style="cursor: pointer;" onclick="showUserProfilePictureModal()">
                                <i class="fas fa-camera position-absolute" style="bottom: 10px; right: 10px; background: #007bff; color: white; border-radius: 50%; padding: 8px; cursor: pointer;" onclick="showUserProfilePictureModal()" title="Change photo"></i>
                            </div>
                            <h4>${currentUser.firstName || ''} ${currentUser.lastName || ''}</h4>
                            <p class="text-muted">@${currentUser.username}</p>
                            <p class="text-muted">${currentUser.email}</p>
                            <span class="badge bg-primary">${currentUser.role}</span>
                        </div>
                    </div>
                    
                    <div class="list-group mt-3">
                        <a href="#" class="list-group-item list-group-item-action active" onclick="showProfileInfo()">
                            <i class="fas fa-user me-2"></i>Profile Info
                        </a>
                        <a href="#" class="list-group-item list-group-item-action" onclick="showAddressesSection()">
                            <i class="fas fa-map-marker-alt me-2"></i>Manage Addresses
                        </a>
                    </div>
                </div>
                
                <div class="col-md-9">
                    <div id="profileContent">
                        <!-- Profile content will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showProfileInfo();
}

function showProfileInfo() {
    document.querySelectorAll('.list-group-item').forEach(item => item.classList.remove('active'));
    event.target.classList.add('active');
    
    const profileContent = document.getElementById('profileContent');
    profileContent.innerHTML = `
        <div class="card shadow-custom">
            <div class="card-header">
                <h5><i class="fas fa-user-edit me-2"></i>Edit Profile</h5>
            </div>
            <div class="card-body">
                <form id="profileForm" onsubmit="handleUserProfileUpdate(event)">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-floating mb-3">
                                <input type="text" class="form-control" id="profileFirstName" 
                                       value="${currentUser.firstName || ''}" placeholder="First Name">
                                <label for="profileFirstName">First Name</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating mb-3">
                                <input type="text" class="form-control" id="profileLastName" 
                                       value="${currentUser.lastName || ''}" placeholder="Last Name">
                                <label for="profileLastName">Last Name</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-floating mb-3">
                        <input type="tel" class="form-control" id="profilePhone" 
                               value="${currentUser.phone || ''}" placeholder="Phone">
                        <label for="profilePhone">Phone</label>
                    </div>
                    
                    <div class="form-floating mb-3">
                        <textarea class="form-control" id="profileAddress" 
                                  placeholder="Address" style="height: 100px">${currentUser.address || ''}</textarea>
                        <label for="profileAddress">Address</label>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Update Profile
                    </button>
                </form>
            </div>
        </div>
    `;
}

async function handleUserProfileUpdate(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('profileFirstName').value;
    const lastName = document.getElementById('profileLastName').value;
    const phone = document.getElementById('profilePhone').value;
    const address = document.getElementById('profileAddress').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/user/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName,
                lastName,
                phone,
                address
            })
        });
        
        if (response.ok) {
            const updatedUser = await response.json();
            currentUser = { ...currentUser, ...updatedUser };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserInterface();
            showNotification('Profile updated successfully!', 'success');
            loadProfilePage();
        } else {
            showNotification('Failed to update profile', 'error');
        }
        
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('Failed to update profile', 'error');
    }
}

async function showAddressesSection() {
    document.querySelectorAll('.list-group-item').forEach(item => item.classList.remove('active'));
    event.target.classList.add('active');
    
    const profileContent = document.getElementById('profileContent');
    profileContent.innerHTML = `
        <div class="card shadow-custom">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="fas fa-map-marker-alt me-2"></i>Manage Addresses</h5>
                <button class="btn btn-primary btn-sm" onclick="showAddAddressModal()">
                    <i class="fas fa-plus me-2"></i>Add Address
                </button>
            </div>
            <div class="card-body">
                <div id="addressesList">
                    <div class="text-center py-4">
                        <div class="loading-spinner"></div>
                        <p class="mt-3">Loading addresses...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    await loadUserAddresses();
}

async function loadUserAddresses() {
    try {
        const response = await fetch(`${API_BASE_URL}/addresses/user/${currentUser.id}`);
        const addresses = await response.json();
        
        const addressesList = document.getElementById('addressesList');
        
        if (addresses.length === 0) {
            addressesList.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No addresses found</p>
                    <button class="btn btn-primary" onclick="showAddAddressModal()">
                        <i class="fas fa-plus me-2"></i>Add Your First Address
                    </button>
                </div>
            `;
            return;
        }
        
        addressesList.innerHTML = addresses.map(address => `
            <div class="card mb-3 ${address.isDefault ? 'border-primary' : ''}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title">
                                ${address.title}
                                ${address.isDefault ? '<span class="badge bg-primary ms-2">Default</span>' : ''}
                            </h6>

                            <p class="card-text mb-1">${address.addressLine}</p>
                            <p class="card-text text-muted">${address.city}, ${address.state} ${address.zipCode}</p>
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="editAddress(${address.id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="deleteAddress(${address.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading addresses:', error);
        document.getElementById('addressesList').innerHTML = `
            <div class="text-center py-4 text-danger">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <p>Error loading addresses</p>
            </div>
        `;
    }
}

function showAddAddressModal() {
    const modalHTML = `
        <div class="modal fade" id="addressModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-plus me-2"></i>Add New Address</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addressForm" onsubmit="handleAddAddress(event)">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="addressTitle" required>
                                        <label for="addressTitle">Address Title (e.g., Home, Office)</label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-floating mb-3">
                                <textarea class="form-control" id="addressLine" style="height: 80px" required></textarea>
                                <label for="addressLine">Address Line</label>
                            </div>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="addressCity" required>
                                        <label for="addressCity">City</label>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="addressState" required>
                                        <label for="addressState">State</label>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="addressZipCode" required>
                                        <label for="addressZipCode">ZIP Code</label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="isDefault">
                                <label class="form-check-label" for="isDefault">
                                    Set as default address
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" form="addressForm" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>Save Address
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('addressModal'));
    modal.show();
    
    document.getElementById('addressModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

async function handleAddAddress(event) {
    event.preventDefault();
    
    const addressData = {
        userId: currentUser.id,
        title: document.getElementById('addressTitle').value,
        addressLine: document.getElementById('addressLine').value,
        city: document.getElementById('addressCity').value,
        state: document.getElementById('addressState').value,
        zipCode: document.getElementById('addressZipCode').value,
        isDefault: document.getElementById('isDefault').checked
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
            showNotification('Address added successfully', 'success');
            await loadUserAddresses();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addressModal'));
            modal.hide();
        } else {
            showNotification(data.message || 'Failed to add address', 'error');
        }
    } catch (error) {
        console.error('Error adding address:', error);
        showNotification('Failed to add address', 'error');
    }
}

async function deleteAddress(addressId) {
    if (!confirm('Are you sure you want to delete this address?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/addresses/${addressId}?userId=${currentUser.id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Address deleted successfully', 'success');
            await loadUserAddresses();
        } else {
            showNotification(data.message || 'Failed to delete address', 'error');
        }
    } catch (error) {
        console.error('Error deleting address:', error);
        showNotification('Failed to delete address', 'error');
    }
}

function showUserProfilePictureModal() {
    const modalHTML = `
        <div class="modal fade" id="userProfilePictureModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-user-circle me-2"></i>Update Profile Picture</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="userProfilePictureForm" onsubmit="handleUserProfilePictureUpdate(event)">
                            <div class="text-center mb-3">
                                <img id="currentUserProfilePic" src="${currentUser.profilePicture || 'https://via.placeholder.com/150x150/007bff/ffffff?text=' + (currentUser.firstName?.charAt(0) || currentUser.username.charAt(0))}" 
                                     class="rounded-circle" width="150" height="150" alt="Current Profile">
                            </div>
                            <div class="mb-3">
                                <label for="userProfilePictureFile" class="form-label">Upload New Picture</label>
                                <input type="file" class="form-control" id="userProfilePictureFile" accept="image/*">
                            </div>
                            <div class="mb-3">
                                <img id="userProfilePicturePreview" src="" alt="Preview" class="img-fluid rounded-circle mx-auto d-block" style="display: none; max-width: 150px;">
                            </div>
                            <div class="mb-3">
                                <label for="userProfilePictureUrl" class="form-label">Or Image URL</label>
                                <input type="url" class="form-control" id="userProfilePictureUrl" placeholder="https://example.com/image.jpg">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" form="userProfilePictureForm" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>Update Picture
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('userProfilePictureFile').addEventListener('change', function() {
        const file = this.files[0];
        const preview = document.getElementById('userProfilePicturePreview');
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            document.getElementById('userProfilePictureUrl').value = '';
        }
    });
    
    document.getElementById('userProfilePictureUrl').addEventListener('input', function() {
        const preview = document.getElementById('userProfilePicturePreview');
        if (this.value) {
            preview.src = this.value;
            preview.style.display = 'block';
            document.getElementById('userProfilePictureFile').value = '';
        } else {
            preview.style.display = 'none';
        }
    });
    
    const modal = new bootstrap.Modal(document.getElementById('userProfilePictureModal'));
    modal.show();
    
    document.getElementById('userProfilePictureModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

async function handleUserProfilePictureUpdate(event) {
    event.preventDefault();
    
    let profilePictureUrl = document.getElementById('userProfilePictureUrl').value;
    const imageFile = document.getElementById('userProfilePictureFile').files[0];
    
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
            currentUser.profilePicture = profilePictureUrl;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showNotification('Profile picture updated successfully', 'success');
            loadProfilePage();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('userProfilePictureModal'));
            modal.hide();
        } else {
            showNotification(data.message || 'Failed to update profile picture', 'error');
        }
    } catch (error) {
        console.error('Error updating profile picture:', error);
        showNotification('Failed to update profile picture', 'error');
    }
}

function showForgotPassword() {
    const loginPage = document.getElementById('loginPage');
    loginPage.innerHTML = `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-4">
                    <div class="card shadow-custom border-radius-custom">
                        <div class="card-body p-4">
                            <div class="text-center mb-4">
                                <i class="fas fa-key fa-3x text-primary mb-3"></i>
                                <h3 class="text-gradient">Forgot Password</h3>
                                <p class="text-muted">Enter your email to reset your password</p>
                            </div>
                            
                            <form id="forgotPasswordForm" onsubmit="handleForgotPassword(event)">
                                <div class="form-floating mb-3">
                                    <input type="email" class="form-control" id="forgotEmail" placeholder="Email" required>
                                    <label for="forgotEmail">Email Address</label>
                                </div>
                                
                                <button type="submit" class="btn btn-primary w-100 mb-3" id="forgotBtn">
                                    <span id="forgotSpinner" class="loading-spinner" style="display: none;"></span>
                                    Send Reset Link
                                </button>
                            </form>
                            
                            <div class="text-center">
                                <p class="mb-0">
                                    <a href="#" onclick="showLogin()" class="text-primary">Back to Login</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    const forgotBtn = document.getElementById('forgotBtn');
    const spinner = document.getElementById('forgotSpinner');
    
    forgotBtn.disabled = true;
    spinner.style.display = 'inline-block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Password reset instructions sent to your email!', 'success');
            showResetTokenInput(data.resetToken);
        } else {
            showNotification(data.message || 'Email not found', 'error');
        }
        
    } catch (error) {
        console.error('Forgot password error:', error);
        showNotification('Failed to send reset email', 'error');
    } finally {
        forgotBtn.disabled = false;
        spinner.style.display = 'none';
    }
}

function showResetTokenInput(demoToken = null) {
    const loginPage = document.getElementById('loginPage');
    loginPage.innerHTML = `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-5">
                    <div class="card shadow-custom border-radius-custom">
                        <div class="card-body p-4">
                            <div class="text-center mb-4">
                                <i class="fas fa-lock fa-3x text-success mb-3"></i>
                                <h3 class="text-gradient">Reset Password</h3>
                                <p class="text-muted">Check your email for the reset token and enter it below</p>
                            </div>
                            
                            ${demoToken ? `
                                <div class="alert alert-success">
                                    <i class="fas fa-key me-2"></i>
                                    <strong>Demo Token:</strong> <code>${demoToken}</code>
                                    <button class="btn btn-sm btn-outline-success ms-2" onclick="document.getElementById('resetToken').value='${demoToken}'">Use Token</button>
                                </div>
                            ` : `
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    <strong>Demo Mode:</strong> Check the browser console for the reset token
                                </div>
                            `}
                            
                            <form id="resetPasswordForm" onsubmit="handleResetPassword(event)">
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="resetToken" placeholder="Reset Token" required>
                                    <label for="resetToken">Reset Token</label>
                                </div>
                                
                                <div class="form-floating mb-3">
                                    <input type="password" class="form-control" id="newPassword" placeholder="New Password" required minlength="6">
                                    <label for="newPassword">New Password</label>
                                </div>
                                
                                <div class="form-floating mb-3">
                                    <input type="password" class="form-control" id="confirmNewPassword" placeholder="Confirm Password" required>
                                    <label for="confirmNewPassword">Confirm New Password</label>
                                </div>
                                
                                <button type="submit" class="btn btn-success w-100 mb-3" id="resetBtn">
                                    <span id="resetSpinner" class="loading-spinner" style="display: none;"></span>
                                    Reset Password
                                </button>
                            </form>
                            
                            <div class="text-center">
                                <p class="mb-0">
                                    <a href="#" onclick="showLogin()" class="text-primary">Back to Login</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function handleResetPassword(event) {
    event.preventDefault();
    
    const token = document.getElementById('resetToken').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    const resetBtn = document.getElementById('resetBtn');
    const spinner = document.getElementById('resetSpinner');
    
    resetBtn.disabled = true;
    spinner.style.display = 'inline-block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Password reset successfully! Please login with your new password.', 'success');
            loadLoginPage();
        } else {
            showNotification(data.message || 'Invalid or expired reset token', 'error');
        }
        
    } catch (error) {
        console.error('Reset password error:', error);
        showNotification('Failed to reset password', 'error');
    } finally {
        resetBtn.disabled = false;
        spinner.style.display = 'none';
    }
}

function showEmailExistsError(email) {
    const registerPage = document.getElementById('registerPage');
    registerPage.innerHTML = `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-5">
                    <div class="card shadow-custom border-radius-custom">
                        <div class="card-body p-4">
                            <div class="text-center mb-4">
                                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                                <h3 class="text-gradient">Email Already Exists</h3>
                                <p class="text-muted">The email address <strong>${email}</strong> is already registered.</p>
                            </div>
                            
                            <div class="alert alert-warning">
                                <i class="fas fa-info-circle me-2"></i>
                                This email is already associated with an account. You have the following options:
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" onclick="showLogin()">
                                    <i class="fas fa-sign-in-alt me-2"></i>Login to Existing Account
                                </button>
                                
                                <button class="btn btn-outline-secondary" onclick="showForgotPasswordWithEmail('${email}')">
                                    <i class="fas fa-key me-2"></i>Reset Password
                                </button>
                                
                                <button class="btn btn-outline-info" onclick="showRegister()">
                                    <i class="fas fa-user-plus me-2"></i>Try Different Email
                                </button>
                            </div>
                            
                            <hr class="my-4">
                            
                            <div class="text-center">
                                <p class="mb-0">
                                    <a href="#" onclick="showHome()" class="text-muted">Back to Home</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showForgotPasswordWithEmail(email) {
    showForgotPassword();
    // Pre-fill the email after a short delay to ensure the form is loaded
    setTimeout(() => {
        const emailField = document.getElementById('forgotEmail');
        if (emailField) {
            emailField.value = email;
        }
    }, 100);
}

let emailCheckTimeout;

async function checkEmailExists(email) {
    clearTimeout(emailCheckTimeout);
    
    const emailField = document.getElementById('registerEmail');
    const feedback = document.getElementById('emailFeedback');
    
    if (!email || !email.includes('@')) {
        feedback.style.display = 'none';
        emailField.classList.remove('is-valid', 'is-invalid');
        return;
    }
    
    emailCheckTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/check-email/${encodeURIComponent(email)}`);
            const data = await response.json();
            
            if (data.exists) {
                emailField.classList.remove('is-valid');
                emailField.classList.add('is-invalid');
                feedback.className = 'text-danger mt-2';
                feedback.innerHTML = `
                    <i class="fas fa-exclamation-circle me-1"></i>
                    Email already exists. 
                    <a href="#" onclick="showLogin()" class="text-primary">Login</a> or 
                    <a href="#" onclick="showForgotPasswordWithEmail('${email}')" class="text-primary">Reset Password</a>
                `;
                feedback.style.display = 'block';
            } else {
                emailField.classList.remove('is-invalid');
                emailField.classList.add('is-valid');
                feedback.className = 'text-success mt-2';
                feedback.innerHTML = '<i class="fas fa-check-circle me-1"></i>Email available';
                feedback.style.display = 'block';
            }
        } catch (error) {
            console.error('Error checking email:', error);
            emailField.classList.remove('is-valid', 'is-invalid');
            feedback.style.display = 'none';
        }
    }, 500);
}