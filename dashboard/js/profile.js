document.addEventListener('DOMContentLoaded', () => {
    initializeProfile();
    setupProfileForm();
    setupPasswordChange();
    setupPrivacySettings();
    setupActivityHistory();
    setupLinkedAccounts();
    setupStorageUsage();
});

// Initialize profile
function initializeProfile() {
    loadUserProfile();
    setupAvatarUpload();
    setupNavigationTabs();
}

// Load user profile data
async function loadUserProfile() {
    const user = window.auth.getCurrentUser();
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    updateProfileDisplay(user);
}

// Update profile display
function updateProfileDisplay(user) {
    // Update avatar
    const avatar = document.getElementById('profile-avatar');
    if (avatar) {
        avatar.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`;
        avatar.alt = user.name;
    }

    // Update name and email
    document.getElementById('profile-name')?.textContent = user.name;
    document.getElementById('profile-email')?.textContent = user.email;

    // Update account type badge
    const accountType = document.getElementById('account-type');
    if (accountType) {
        accountType.textContent = user.plan;
        accountType.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.plan === 'Pro' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`;
    }
}

// Setup avatar upload
function setupAvatarUpload() {
    const avatarContainer = document.getElementById('avatar-container');
    const avatarInput = document.createElement('input');
    avatarInput.type = 'file';
    avatarInput.accept = 'image/*';
    avatarInput.className = 'hidden';

    if (avatarContainer) {
        avatarContainer.appendChild(avatarInput);
        avatarContainer.addEventListener('click', () => avatarInput.click());

        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                window.cloudStore.createNotification('Please select an image file', 'error');
                return;
            }

            try {
                // Show loading state
                const avatar = document.getElementById('profile-avatar');
                const originalSrc = avatar.src;
                avatar.classList.add('opacity-50');
                
                // Create overlay with spinner
                const overlay = document.createElement('div');
                overlay.className = 'absolute inset-0 flex items-center justify-center';
                overlay.innerHTML = `
                    <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                `;
                avatarContainer.appendChild(overlay);

                // Simulate upload
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Update avatar
                const reader = new FileReader();
                reader.onload = (e) => {
                    avatar.src = e.target.result;
                    window.cloudStore.createNotification('Avatar updated successfully', 'success');
                };
                reader.readAsDataURL(file);

            } catch (error) {
                window.cloudStore.createNotification('Failed to update avatar', 'error');
                const avatar = document.getElementById('profile-avatar');
                avatar.src = originalSrc;
            } finally {
                avatar.classList.remove('opacity-50');
                avatarContainer.querySelector('.absolute')?.remove();
            }
        });
    }
}

// Setup navigation tabs
function setupNavigationTabs() {
    const tabs = document.querySelectorAll('[data-tab]');
    const panels = document.querySelectorAll('[data-panel]');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            // Update tab states
            tabs.forEach(t => {
                t.classList.toggle('border-blue-500', t.dataset.tab === target);
                t.classList.toggle('border-transparent', t.dataset.tab !== target);
                t.classList.toggle('text-blue-600', t.dataset.tab === target);
                t.classList.toggle('text-gray-500', t.dataset.tab !== target);
            });

            // Update panel visibility
            panels.forEach(panel => {
                if (panel.dataset.panel === target) {
                    panel.classList.remove('hidden');
                    animatePanel(panel);
                } else {
                    panel.classList.add('hidden');
                }
            });
        });
    });
}

// Animate panel content
function animatePanel(panel) {
    const elements = panel.querySelectorAll('.animate-fade-in');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.3s ease-out';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Setup profile form
function setupProfileForm() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    // Load current values
    const user = window.auth.getCurrentUser();
    if (user) {
        form.elements.name.value = user.name;
        form.elements.email.value = user.email;
        form.elements.phone.value = user.phone || '';
        form.elements.company.value = user.company || '';
        form.elements.location.value = user.location || '';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        try {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <div class="flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                </div>
            `;

            // Gather form data
            const formData = new FormData(form);
            const updates = Object.fromEntries(formData.entries());

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update local user data
            const updatedUser = { ...user, ...updates };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            window.cloudStore.createNotification('Profile updated successfully', 'success');
            updateProfileDisplay(updatedUser);

        } catch (error) {
            window.cloudStore.createNotification('Failed to update profile', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// Setup password change
function setupPasswordChange() {
    const form = document.getElementById('password-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        try {
            // Validate passwords
            const currentPassword = form.elements.currentPassword.value;
            const newPassword = form.elements.newPassword.value;
            const confirmPassword = form.elements.confirmPassword.value;

            if (newPassword !== confirmPassword) {
                throw new Error('New passwords do not match');
            }

            if (newPassword.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }

            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <div class="flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Updating...
                </div>
            `;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            window.cloudStore.createNotification('Password updated successfully', 'success');
            form.reset();

        } catch (error) {
            window.cloudStore.createNotification(error.message || 'Failed to update password', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// Setup privacy settings
function setupPrivacySettings() {
    const form = document.getElementById('privacy-form');
    if (!form) return;

    // Load current settings
    const settings = JSON.parse(localStorage.getItem('privacySettings') || '{}');
    Object.entries(settings).forEach(([key, value]) => {
        const input = form.elements[key];
        if (input) {
            input.checked = value;
        }
    });

    // Handle changes
    form.addEventListener('change', (e) => {
        const input = e.target;
        if (input.type === 'checkbox') {
            const settings = JSON.parse(localStorage.getItem('privacySettings') || '{}');
            settings[input.name] = input.checked;
            localStorage.setItem('privacySettings', JSON.stringify(settings));
            
            window.cloudStore.createNotification('Privacy settings updated', 'success');
        }
    });
}

// Setup activity history
function setupActivityHistory() {
    const container = document.getElementById('activity-history');
    if (!container) return;

    // Mock activity data
    const activities = [
        {
            type: 'login',
            device: 'Chrome on Windows',
            location: 'New York, US',
            time: '2024-01-15T10:30:00Z'
        },
        {
            type: 'password_change',
            device: 'Firefox on MacOS',
            location: 'San Francisco, US',
            time: '2024-01-14T15:45:00Z'
        },
        {
            type: 'profile_update',
            device: 'Safari on iPhone',
            location: 'London, UK',
            time: '2024-01-13T09:15:00Z'
        }
    ];

    container.innerHTML = activities.map(activity => `
        <div class="flex items-start space-x-3 p-4 hover:bg-gray-50 animate-fade-in">
            <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}">
                    <i class="fas ${getActivityIcon(activity.type)} text-white"></i>
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">
                    ${getActivityDescription(activity.type)}
                </p>
                <div class="mt-1 text-xs text-gray-500">
                    <span>${activity.device}</span>
                    <span class="mx-1">·</span>
                    <span>${activity.location}</span>
                    <span class="mx-1">·</span>
                    <span>${window.cloudStore.formatDate(activity.time)}</span>
                </div>
            </div>
            ${activity.type === 'login' ? `
                <button class="text-sm text-red-600 hover:text-red-700" onclick="revokeSession('${activity.time}')">
                    Revoke
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Get activity icon
function getActivityIcon(type) {
    const icons = {
        login: 'fa-sign-in-alt',
        password_change: 'fa-key',
        profile_update: 'fa-user-edit',
        security_alert: 'fa-shield-alt'
    };
    return icons[type] || 'fa-circle';
}

// Get activity color
function getActivityColor(type) {
    const colors = {
        login: 'bg-green-500',
        password_change: 'bg-blue-500',
        profile_update: 'bg-purple-500',
        security_alert: 'bg-red-500'
    };
    return colors[type] || 'bg-gray-500';
}

// Get activity description
function getActivityDescription(type) {
    const descriptions = {
        login: 'Signed in to account',
        password_change: 'Changed account password',
        profile_update: 'Updated profile information',
        security_alert: 'Security alert detected'
    };
    return descriptions[type] || 'Unknown activity';
}

// Revoke session
async function revokeSession(sessionTime) {
    try {
        // Show confirmation dialog
        const confirmed = await showConfirmationDialog(
            'Revoke Session',
            'Are you sure you want to revoke this session? This will sign out the device.'
        );

        if (!confirmed) return;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        window.cloudStore.createNotification('Session revoked successfully', 'success');
        setupActivityHistory(); // Refresh list

    } catch (error) {
        window.cloudStore.createNotification('Failed to revoke session', 'error');
    }
}

// Show confirmation dialog
function showConfirmationDialog(title, message) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in';
        dialog.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale">
                <h3 class="text-lg font-medium text-gray-900 mb-2">${title}</h3>
                <p class="text-gray-500 mb-4">${message}</p>
                <div class="flex justify-end space-x-3">
                    <button class="px-4 py-2 text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove(); resolve(false)">
                        Cancel
                    </button>
                    <button class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onclick="this.closest('.fixed').remove(); resolve(true)">
                        Revoke
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
    });
}

// Setup linked accounts
function setupLinkedAccounts() {
    const container = document.getElementById('linked-accounts');
    if (!container) return;

    // Mock linked accounts
    const accounts = [
        {
            provider: 'google',
            name: 'Google',
            email: 'user@gmail.com',
            connected: true
        },
        {
            provider: 'github',
            name: 'GitHub',
            email: 'user@github.com',
            connected: false
        }
    ];

    container.innerHTML = accounts.map(account => `
        <div class="flex items-center justify-between p-4 hover:bg-gray-50 animate-fade-in">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-${account.provider}-100">
                    <i class="fab fa-${account.provider} text-${account.provider}-600"></i>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-900">${account.name}</p>
                    <p class="text-xs text-gray-500">${account.email || 'Not connected'}</p>
                </div>
            </div>
            <button onclick="toggleAccount('${account.provider}')" 
                    class="px-3 py-1 rounded-full text-sm font-medium ${
                        account.connected
                            ? 'text-red-600 hover:text-red-700'
                            : 'text-blue-600 hover:text-blue-700'
                    }">
                ${account.connected ? 'Disconnect' : 'Connect'}
            </button>
        </div>
    `).join('');
}

// Toggle account connection
async function toggleAccount(provider) {
    try {
        const button = event.target;
        const isConnecting = button.textContent === 'Connect';
        const originalText = button.textContent;

        // Show loading state
        button.disabled = true;
        button.innerHTML = `
            <div class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                ${isConnecting ? 'Connecting...' : 'Disconnecting...'}
            </div>
        `;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        window.cloudStore.createNotification(
            `Successfully ${isConnecting ? 'connected to' : 'disconnected from'} ${provider}`,
            'success'
        );
        setupLinkedAccounts(); // Refresh list

    } catch (error) {
        window.cloudStore.createNotification(
            `Failed to ${isConnecting ? 'connect to' : 'disconnect from'} ${provider}`,
            'error'
        );
        button.disabled = false;
        button.textContent = originalText;
    }
}

// Setup storage usage
function setupStorageUsage() {
    const container = document.getElementById('storage-usage');
    if (!container) return;

    // Mock storage data
    const storageData = {
        used: 25, // GB
        total: 100, // GB
        files: {
            documents: 8,
            images: 10,
            videos: 5,
            others: 2
        }
    };

    const percentage = (storageData.used / storageData.total) * 100;
    const isNearLimit = percentage > 80;

    container.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <div>
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                    <span>${storageData.used} GB used</span>
                    <span>${storageData.total} GB total</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full ${isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'}"
                         style="width: ${percentage}%"></div>
                </div>
                ${isNearLimit ? `
                    <p class="text-sm text-yellow-600 mt-2">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        You're almost out of storage space
                    </p>
                ` : ''}
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-sm font-medium text-gray-900 mb-4">Storage Distribution</h4>
                <div class="space-y-4">
                    ${Object.entries(storageData.files).map(([type, size]) => `
                        <div>
                            <div class="flex justify-between text-sm text-gray-600 mb-1">
                                <span class="capitalize">${type}</span>
                                <span>${size} GB</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-1">
                                <div class="h-1 rounded-full ${getStorageTypeColor(type)}"
                                     style="width: ${(size / storageData.used) * 100}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="flex justify-end">
                <button onclick="upgradePlan()" 
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Upgrade Storage
                </button>
            </div>
        </div>
    `;
}

// Get storage type color
function getStorageTypeColor(type) {
    const colors = {
        documents: 'bg-blue-500',
        images: 'bg-green-500',
        videos: 'bg-purple-500',
        others: 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
}

// Upgrade plan
function upgradePlan() {
    window.location.href = '/dashboard/settings.html#plans';
}