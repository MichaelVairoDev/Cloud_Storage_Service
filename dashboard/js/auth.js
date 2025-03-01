// Auth class for handling authentication
class Auth {
    constructor() {
        this.baseUrl = '/api';
        this.tokenKey = 'auth_token';
        this.userKey = 'user';
        this.setupAuthStateChange();
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem(this.tokenKey);
    }

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    // Login
    async login(email, password) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock successful login
            const mockUser = {
                id: '123',
                name: email.split('@')[0].replace(/[.]/g, ' '),
                email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}`,
                plan: 'Pro',
                storage: {
                    used: 25,
                    total: 100,
                    files: 128,
                    shared: 12
                }
            };

            const mockToken = 'mock_jwt_token_' + Date.now();

            // Store auth data
            localStorage.setItem(this.tokenKey, mockToken);
            localStorage.setItem(this.userKey, JSON.stringify(mockUser));

            // Trigger auth state change
            this.onAuthStateChanged(mockUser);

            return mockUser;
        } catch (error) {
            throw new Error('Invalid credentials');
        }
    }

    // Register
    async register(name, email, password) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock successful registration
            const mockUser = {
                id: Date.now().toString(),
                name,
                email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
                plan: 'Free',
                storage: {
                    used: 0,
                    total: 10,
                    files: 0,
                    shared: 0
                }
            };

            const mockToken = 'mock_jwt_token_' + Date.now();

            // Store auth data
            localStorage.setItem(this.tokenKey, mockToken);
            localStorage.setItem(this.userKey, JSON.stringify(mockUser));

            // Trigger auth state change
            this.onAuthStateChanged(mockUser);

            return mockUser;
        } catch (error) {
            throw new Error('Registration failed');
        }
    }

    // Logout
    async logout() {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // Clear auth data
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);

            // Trigger auth state change
            this.onAuthStateChanged(null);

            // Redirect to login page
            window.location.href = '/login.html';
        } catch (error) {
            throw new Error('Logout failed');
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            window.cloudStore.createNotification('Password reset link sent to your email', 'success');
        } catch (error) {
            throw new Error('Password reset failed');
        }
    }

    // Update profile
    async updateProfile(data) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const currentUser = this.getCurrentUser();
            const updatedUser = { ...currentUser, ...data };

            // Update stored user data
            localStorage.setItem(this.userKey, JSON.stringify(updatedUser));

            // Trigger auth state change
            this.onAuthStateChanged(updatedUser);

            return updatedUser;
        } catch (error) {
            throw new Error('Profile update failed');
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            window.cloudStore.createNotification('Password changed successfully', 'success');
        } catch (error) {
            throw new Error('Password change failed');
        }
    }

    // Auth state change handler
    setupAuthStateChange() {
        this.authStateChangeCallbacks = [];

        // Check auth state on page load
        const user = this.getCurrentUser();
        if (user) {
            this.onAuthStateChanged(user);
        }

        // Handle storage events for multi-tab sync
        window.addEventListener('storage', (e) => {
            if (e.key === this.userKey) {
                const user = e.newValue ? JSON.parse(e.newValue) : null;
                this.onAuthStateChanged(user);
            }
        });
    }

    // Subscribe to auth state changes
    onAuthStateChange(callback) {
        this.authStateChangeCallbacks.push(callback);
        
        // Call immediately with current state
        const currentUser = this.getCurrentUser();
        callback(currentUser);
    }

    // Trigger auth state change
    onAuthStateChanged(user) {
        this.authStateChangeCallbacks.forEach(callback => callback(user));
        
        // Update UI elements
        this.updateAuthUI(user);
    }

    // Update UI based on auth state
    updateAuthUI(user) {
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        const signOutButton = document.getElementById('signOutButton');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userPlan = document.getElementById('userPlan');
        const welcomeMessage = document.getElementById('welcomeMessage');

        if (user) {
            // User is logged in
            if (loginLink) loginLink.classList.add('hidden');
            if (registerLink) registerLink.classList.add('hidden');
            if (signOutButton) {
                signOutButton.classList.remove('hidden');
                signOutButton.addEventListener('click', () => this.logout());
            }
            if (userAvatar) userAvatar.src = user.avatar;
            if (userName) userName.textContent = user.name;
            if (userPlan) userPlan.textContent = user.plan;
            if (welcomeMessage) welcomeMessage.textContent = `Welcome back, ${user.name.split(' ')[0]}!`;
        } else {
            // User is logged out
            if (loginLink) loginLink.classList.remove('hidden');
            if (registerLink) registerLink.classList.remove('hidden');
            if (signOutButton) signOutButton.classList.add('hidden');
            if (userAvatar) userAvatar.src = 'https://ui-avatars.com/api/?name=Guest+User';
            if (userName) userName.textContent = 'Guest User';
            if (userPlan) userPlan.textContent = 'Free Plan';
            if (welcomeMessage) welcomeMessage.textContent = 'Welcome to CloudStore!';
        }
    }

    // Social auth methods
    async socialLogin(provider) {
        try {
            // Simulate OAuth flow
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock successful social login
            const mockUser = {
                id: Date.now().toString(),
                name: 'Social User',
                email: `user@${provider}.com`,
                avatar: `https://ui-avatars.com/api/?name=Social+User`,
                plan: 'Free',
                storage: {
                    used: 0,
                    total: 10,
                    files: 0,
                    shared: 0
                }
            };

            const mockToken = 'mock_jwt_token_' + Date.now();

            // Store auth data
            localStorage.setItem(this.tokenKey, mockToken);
            localStorage.setItem(this.userKey, JSON.stringify(mockUser));

            // Trigger auth state change
            this.onAuthStateChanged(mockUser);

            return mockUser;
        } catch (error) {
            throw new Error(`${provider} login failed`);
        }
    }
}

// Initialize auth
window.auth = new Auth();

// Add auth state observer
window.auth.onAuthStateChange((user) => {
    // Handle auth state changes
    if (user) {
        // User is signed in
        console.log('User signed in:', user);

        // Update UI based on current page
        const path = window.location.pathname;
        if (path.includes('/login.html') || path.includes('/register.html')) {
            window.location.href = '/dashboard/index.html';
        }
    } else {
        // User is signed out
        console.log('User signed out');

        // Redirect to login if accessing protected pages
        const protectedPaths = ['/dashboard/'];
        if (protectedPaths.some(path => window.location.pathname.includes(path))) {
            window.location.href = '/login.html';
        }
    }
});