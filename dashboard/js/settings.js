document.addEventListener('DOMContentLoaded', () => {
    initializeSettings();
    setupThemeToggle();
    setupNotificationPreferences();
    setupStorageManagement();
    setupSecuritySettings();
    setupDeviceSync();
    loadUserPreferences();
    initializeSecuritySettings();
    setupLoginHistory();
    setupDeviceList();
});

// Initialize settings
function initializeSettings() {
    const settings = loadSettings();
    applySettings(settings);
    setupSettingsForms();
}

// Load settings from storage
function loadSettings() {
    const defaultSettings = {
        theme: 'light',
        notifications: {
            uploads: true,
            shares: true,
            comments: true,
            updates: true
        },
        storage: {
            autoSync: true,
            syncInterval: 30,
            compressionEnabled: false
        },
        security: {
            twoFactorEnabled: false,
            autoLockEnabled: true,
            autoLockDelay: 15
        },
        devices: {
            syncEnabled: true,
            offlineAccess: true
        }
    };

    try {
        const storedSettings = JSON.parse(localStorage.getItem('settings'));
        return { ...defaultSettings, ...storedSettings };
    } catch (error) {
        return defaultSettings;
    }
}

// Apply settings to UI
function applySettings(settings) {
    // Theme
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = settings.theme === 'dark';
    }

    // Notifications
    Object.entries(settings.notifications).forEach(([key, value]) => {
        const toggle = document.querySelector(`[data-notification="${key}"]`);
        if (toggle) toggle.checked = value;
    });

    // Storage
    Object.entries(settings.storage).forEach(([key, value]) => {
        const input = document.querySelector(`[data-storage="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = value;
            } else {
                input.value = value;
            }
        }
    });

    // Security
    Object.entries(settings.security).forEach(([key, value]) => {
        const input = document.querySelector(`[data-security="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = value;
            } else {
                input.value = value;
            }
        }
    });

    // Devices
    Object.entries(settings.devices).forEach(([key, value]) => {
        const toggle = document.querySelector(`[data-device="${key}"]`);
        if (toggle) toggle.checked = value;
    });
}

// Setup settings forms
function setupSettingsForms() {
    const forms = document.querySelectorAll('form[data-settings-section]');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const section = form.dataset.settingsSection;
            const formData = new FormData(form);
            const settings = {};

            formData.forEach((value, key) => {
                if (value === 'on') value = true;
                if (value === 'off') value = false;
                settings[key] = value;
            });

            await saveSettings(section, settings);
        });
    });
}

// Save settings
async function saveSettings(section, settings) {
    try {
        const currentSettings = loadSettings();
        const updatedSettings = {
            ...currentSettings,
            [section]: {
                ...currentSettings[section],
                ...settings
            }
        };

        localStorage.setItem('settings', JSON.stringify(updatedSettings));
        
        // Show success message
        window.cloudStore.createNotification('Settings saved successfully', 'success');
        
        // Apply changes immediately
        applySettings(updatedSettings);

    } catch (error) {
        window.cloudStore.createNotification('Failed to save settings', 'error');
    }
}

// Theme toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('change', () => {
        const isDark = themeToggle.checked;
        saveSettings('theme', isDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', isDark);
    });

    // Watch system theme changes
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    systemDarkMode.addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === 'system') {
            document.documentElement.classList.toggle('dark', e.matches);
        }
    });
}

// Notification preferences
function setupNotificationPreferences() {
    const notificationToggles = document.querySelectorAll('[data-notification]');
    
    setupEmailPreferences();
    setupPushNotifications();
    setupNotificationSchedule();
    setupCustomNotifications();

    notificationToggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            const type = toggle.dataset.notification;
            const enabled = toggle.checked;
            saveSettings('notifications', { [type]: enabled });

            if (enabled) {
                requestNotificationPermission();
            }
        });
    });
}

// Request notification permission
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            window.cloudStore.createNotification('Notifications enabled', 'success');
        } else {
            window.cloudStore.createNotification('Please enable notifications in your browser settings', 'warning');
        }
    } catch (error) {
        window.cloudStore.createNotification('Failed to enable notifications', 'error');
    }
}

// Setup email preferences
function setupEmailPreferences() {
    const emailFrequencySelect = document.querySelector('[data-notification="emailFrequency"]');
    if (emailFrequencySelect) {
        emailFrequencySelect.addEventListener('change', () => {
            saveSettings('notifications', { emailFrequency: emailFrequencySelect.value });
        });
    }
}

// Setup push notifications
function setupPushNotifications() {
    if ('Notification' in window) {
        const pushEnabled = Notification.permission === 'granted';
        const pushToggle = document.querySelector('[data-notification="push"]');
        
        if (pushToggle) {
            pushToggle.checked = pushEnabled;
            pushToggle.addEventListener('change', async () => {
                if (pushToggle.checked) {
                    await requestNotificationPermission();
                }
            });
        }
    }
}

// Setup notification schedule
function setupNotificationSchedule() {
    const scheduleInputs = {
        startTime: document.querySelector('[data-notification="quietStart"]'),
        endTime: document.querySelector('[data-notification="quietEnd"]'),
        timezone: document.querySelector('[data-notification="timezone"]')
    };

    Object.entries(scheduleInputs).forEach(([key, input]) => {
        if (input) {
            input.addEventListener('change', () => {
                saveSettings('notifications', { [key]: input.value });
            });
        }
    });

    // Set timezone default to user's timezone
    if (scheduleInputs.timezone) {
        scheduleInputs.timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
}

// Setup custom notifications
function setupCustomNotifications() {
    const customRules = [
        { event: 'Large file upload', action: 'notify' },
        { event: 'Storage nearly full', action: 'email' },
        { event: 'Failed sync', action: 'both' }
    ];

    const container = document.querySelector('#custom-notifications');
    if (!container) return;

    container.innerHTML = customRules.map(rule => `
        <div class="flex items-center justify-between p-4 border-b last:border-0">
            <div>
                <p class="font-medium text-gray-900">${rule.event}</p>
                <p class="text-sm text-gray-500">Currently set to: ${getNotificationActionText(rule.action)}</p>
            </div>
            <select class="text-sm border border-gray-300 rounded-lg px-2 py-1" data-rule="${rule.event.toLowerCase().replace(/\s+/g, '-')}">
                <option value="notify" ${rule.action === 'notify' ? 'selected' : ''}>Push notification</option>
                <option value="email" ${rule.action === 'email' ? 'selected' : ''}>Email</option>
                <option value="both" ${rule.action === 'both' ? 'selected' : ''}>Both</option>
                <option value="none">Don't notify</option>
            </select>
        </div>
    `).join('');

    // Add event listeners to selects
    container.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', () => {
            saveSettings('notifications', { 
                customRules: {
                    [select.dataset.rule]: select.value
                }
            });
            
            window.cloudStore.createNotification('Notification preference updated', 'success');
        });
    });
}

// Helper function for notification action text
function getNotificationActionText(action) {
    const actions = {
        notify: 'Push notification',
        email: 'Email only',
        both: 'Push and email',
        none: 'No notification'
    };
    return actions[action] || action;
}

// Handle notification test
function testNotification(type) {
    const messages = {
        push: 'This is a test push notification',
        email: 'Test email notification sent',
        desktop: 'This is a test desktop notification'
    };

    if (type === 'email') {
        window.cloudStore.createNotification('Test email sent to your inbox', 'success');
    } else if (type === 'push' || type === 'desktop') {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('CloudStore Test', {
                body: messages[type],
                icon: '/assets/icon.png'
            });
        } else {
            window.cloudStore.createNotification('Please enable notifications first', 'warning');
        }
    }
}

// Storage management
function setupStorageManagement() {
    const storageInputs = document.querySelectorAll('[data-storage]');
    storageInputs.forEach(input => {
        input.addEventListener('change', () => {
            const setting = input.dataset.storage;
            const value = input.type === 'checkbox' ? input.checked : input.value;
            saveSettings('storage', { [setting]: value });
        });
    });

    setupStorageAnalytics();
    setupCleanupUtilities();
    setupAutoCleanup();
    setupSmartSync();

    // Handle clear cache button
    const clearCacheButton = document.querySelector('[data-action="clear-cache"]');
    if (clearCacheButton) {
        clearCacheButton.addEventListener('click', clearCache);
    }
}

// Setup storage analytics
function setupStorageAnalytics() {
    const storageData = {
        total: 1024 * 1024 * 1024 * 1024, // 1TB
        used: 8.5 * 1024 * 1024 * 1024, // 8.5GB
        distribution: {
            documents: 2.5 * 1024 * 1024 * 1024,
            images: 4.2 * 1024 * 1024 * 1024,
            videos: 1.8 * 1024 * 1024 * 1024
        }
    };

    updateStorageDisplay(storageData);
}

// Update storage display
function updateStorageDisplay(data) {
    const usedPercent = (data.used / data.total * 100).toFixed(2);
    const usedDisplay = document.querySelector('#storage-used');
    const progressBar = document.querySelector('#storage-progress');
    
    if (usedDisplay) {
        usedDisplay.textContent = `${formatSize(data.used)} of ${formatSize(data.total)} used`;
    }
    
    if (progressBar) {
        progressBar.style.width = `${usedPercent}%`;
        if (usedPercent > 90) {
            progressBar.classList.add('bg-red-500');
        } else if (usedPercent > 75) {
            progressBar.classList.add('bg-yellow-500');
        }
    }

    // Update distribution chart
    updateStorageDistribution(data.distribution);
}

// Update storage distribution
function updateStorageDistribution(distribution) {
    const container = document.querySelector('#storage-distribution');
    if (!container) return;

    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    
    container.innerHTML = Object.entries(distribution).map(([type, size]) => `
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
                <i class="fas fa-${getFileTypeIcon(type)} text-${getFileTypeColor(type)} mr-3"></i>
                <span class="text-gray-600">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </div>
            <div class="text-right">
                <span class="text-gray-900">${formatSize(size)}</span>
                <span class="text-gray-500 text-sm ml-2">(${Math.round(size/total*100)}%)</span>
            </div>
        </div>
    `).join('');
}

// Setup cleanup utilities
function setupCleanupUtilities() {
    const cleanupActions = {
        duplicates: document.querySelector('[data-cleanup="duplicates"]'),
        unused: document.querySelector('[data-cleanup="unused"]'),
        temporary: document.querySelector('[data-cleanup="temporary"]')
    };

    Object.entries(cleanupActions).forEach(([type, button]) => {
        if (button) {
            button.addEventListener('click', () => performCleanup(type));
        }
    });
}

// Perform cleanup
async function performCleanup(type) {
    const cleanupTypes = {
        duplicates: 'duplicate files',
        unused: 'unused files',
        temporary: 'temporary files'
    };

    const button = document.querySelector(`[data-cleanup="${type}"]`);
    if (!button) return;

    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = `
        <div class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Scanning...
        </div>
    `;

    try {
        // Simulate cleanup process
        await new Promise(resolve => setTimeout(resolve, 2000));
        const cleanedSize = Math.random() * 500 * 1024 * 1024; // Random size up to 500MB

        window.cloudStore.createNotification(
            `Cleaned ${formatSize(cleanedSize)} of ${cleanupTypes[type]}`,
            'success'
        );

        // Update storage display
        setupStorageAnalytics();

    } catch (error) {
        window.cloudStore.createNotification(`Failed to clean ${cleanupTypes[type]}`, 'error');
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

// Setup auto cleanup
function setupAutoCleanup() {
    const scheduleSelect = document.querySelector('[data-storage="cleanupSchedule"]');
    if (!scheduleSelect) return;

    scheduleSelect.addEventListener('change', () => {
        const schedule = scheduleSelect.value;
        saveSettings('storage', { cleanupSchedule: schedule });
        
        if (schedule !== 'never') {
            window.cloudStore.createNotification(
                `Auto cleanup scheduled for ${schedule}`,
                'success'
            );
        }
    });
}

// Setup smart sync
function setupSmartSync() {
    const smartSyncToggle = document.querySelector('[data-storage="smartSync"]');
    if (!smartSyncToggle) return;

    smartSyncToggle.addEventListener('change', () => {
        const enabled = smartSyncToggle.checked;
        saveSettings('storage', { smartSync: enabled });
        
        if (enabled) {
            setupSmartSyncRules();
        }
    });
}

// Setup smart sync rules
function setupSmartSyncRules() {
    const rules = [
        { type: 'documents', maxSize: '10MB', offline: true },
        { type: 'images', maxSize: '50MB', offline: true },
        { type: 'videos', maxSize: '100MB', offline: false }
    ];

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Smart Sync Rules</h3>
            <div class="space-y-4">
                ${rules.map(rule => `
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p class="font-medium text-gray-900">${rule.type.charAt(0).toUpperCase() + rule.type.slice(1)}</p>
                            <p class="text-sm text-gray-500">Max size: ${rule.maxSize}</p>
                        </div>
                        <label class="flex items-center cursor-pointer">
                            <div class="relative">
                                <input type="checkbox" class="sr-only" ${rule.offline ? 'checked' : ''}>
                                <div class="w-10 h-6 bg-gray-200 rounded-full"></div>
                                <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${rule.offline ? 'translate-x-4' : ''}"></div>
                            </div>
                        </label>
                    </div>
                `).join('')}
            </div>
            <div class="flex justify-end mt-6">
                <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onclick="this.closest('.fixed').remove()">
                    Save Rules
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Helper functions for storage
function formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function getFileTypeIcon(type) {
    const icons = {
        documents: 'file-alt',
        images: 'image',
        videos: 'video'
    };
    return icons[type] || 'file';
}

function getFileTypeColor(type) {
    const colors = {
        documents: 'blue-500',
        images: 'green-500',
        videos: 'purple-500'
    };
    return colors[type] || 'gray-500';
}

// Clear application cache
async function clearCache() {
    try {
        // Clear IndexedDB
        const DBDeleteRequest = indexedDB.deleteDatabase('cloudstore');
        
        // Clear Cache Storage
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));

        // Clear localStorage (except auth)
        const authToken = localStorage.getItem('auth_token');
        const user = localStorage.getItem('user');
        localStorage.clear();
        if (authToken) localStorage.setItem('auth_token', authToken);
        if (user) localStorage.setItem('user', user);

        window.cloudStore.createNotification('Cache cleared successfully', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to clear cache', 'error');
    }
}

// Security settings
function setupSecuritySettings() {
    const securityInputs = document.querySelectorAll('[data-security]');
    
    // Security dashboard data
    const securityDashboard = {
        passwordStrength: 'Strong',
        lastActivity: 'Today at 10:45 AM',
        activeDevices: 3,
        securityScore: 85,
        recentAlerts: [
            { type: 'warning', message: 'Login attempt from new device', time: '2 hours ago' },
            { type: 'info', message: 'Password changed successfully', time: '5 days ago' },
            { type: 'error', message: 'Failed login attempt', time: '1 week ago' }
        ]
    };

    updateSecurityDashboard(securityDashboard);
    setupLoginHistory();
    setupDeviceManagement();
    setupPasswordPolicies();
    setupSecurityAudit();

    // Handle security setting changes
    securityInputs.forEach(input => {
        input.addEventListener('change', async () => {
            const setting = input.dataset.security;
            const value = input.type === 'checkbox' ? input.checked : input.value;
            
            if (setting === 'twoFactorEnabled' && value) {
                await setup2FA();
            } else if (setting === 'backupCodes') {
                await generateBackupCodes();
            } else if (setting === 'securityAudit') {
                await performSecurityAudit();
            } else {
                await saveSecurity(setting, value);
                updateSecurityScore();
            }
        });
    });
}

// Update security dashboard
function updateSecurityDashboard(data) {
    const scoreElement = document.getElementById('security-score');
    const alertsContainer = document.getElementById('security-alerts');
    
    if (scoreElement) {
        const scoreColor = data.securityScore >= 80 ? 'text-green-500' : 
                          data.securityScore >= 60 ? 'text-yellow-500' : 'text-red-500';
        
        scoreElement.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Security Score</span>
                <span class="text-lg font-bold ${scoreColor}">${data.securityScore}%</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full ${scoreColor} transition-all duration-300"
                     style="width: ${data.securityScore}%"></div>
            </div>
        `;
    }

    if (alertsContainer) {
        alertsContainer.innerHTML = data.recentAlerts.map(alert => `
            <div class="flex items-center space-x-3 p-3 ${getAlertBgColor(alert.type)} rounded-lg">
                <i class="fas ${getAlertIcon(alert.type)} ${getAlertTextColor(alert.type)}"></i>
                <div>
                    <p class="text-sm font-medium text-gray-900">${alert.message}</p>
                    <p class="text-xs text-gray-500">${alert.time}</p>
                </div>
            </div>
        `).join('');
    }
}

// Setup device management
function setupDeviceManagement() {
    const deviceList = document.getElementById('device-list');
    const mockDevices = [
        { name: 'MacBook Pro', type: 'laptop', location: 'New York, US', lastActive: '2 minutes ago', current: true },
        { name: 'iPhone 13', type: 'mobile', location: 'New York, US', lastActive: '15 minutes ago', current: false },
        { name: 'iPad Air', type: 'tablet', location: 'Boston, US', lastActive: '3 days ago', current: false }
    ];

    if (deviceList) {
        deviceList.innerHTML = mockDevices.map(device => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <i class="fas fa-${getDeviceIcon(device.type)} text-gray-600"></i>
                    </div>
                    <div>
                        <div class="flex items-center">
                            <p class="text-sm font-medium text-gray-900">${device.name}</p>
                            ${device.current ? `
                                <span class="ml-2 px-2 py-0.5 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                                    Current Device
                                </span>
                            ` : ''}
                        </div>
                        <p class="text-xs text-gray-500">${device.location} • Last active ${device.lastActive}</p>
                    </div>
                </div>
                ${!device.current ? `
                    <button onclick="revokeDevice('${device.name}')" 
                            class="text-red-600 hover:text-red-800 text-sm font-medium">
                        Revoke Access
                    </button>
                ` : ''}
            </div>
        `).join('');
    }
}

// Helper functions for alerts
function getAlertIcon(type) {
    const icons = {
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle',
        info: 'fa-info-circle',
        success: 'fa-check-circle'
    };
    return icons[type] || icons.info;
}

function getAlertBgColor(type) {
    const colors = {
        warning: 'bg-yellow-50',
        error: 'bg-red-50',
        info: 'bg-blue-50',
        success: 'bg-green-50'
    };
    return colors[type] || colors.info;
}

function getAlertTextColor(type) {
    const colors = {
        warning: 'text-yellow-500',
        error: 'text-red-500',
        info: 'text-blue-500',
        success: 'text-green-500'
    };
    return colors[type] || colors.info;
}

function getDeviceIcon(type) {
    const icons = {
        laptop: 'laptop',
        mobile: 'mobile-alt',
        tablet: 'tablet-alt',
        desktop: 'desktop'
    };
    return icons[type] || 'device-unknown';
}

// Initialize security settings
function initializeSecuritySettings() {
    const securityInputs = document.querySelectorAll('[data-security]');
    const mockSecurityData = {
        twoFactorEnabled: false,
        passwordExpiry: '90',
        autoLockDelay: '15',
        lastPasswordChange: '2024-01-01T10:00:00Z',
        securityScore: 85,
        activeDevices: 3,
        lastActivity: new Date().toISOString()
    };

    // Set initial values
    securityInputs.forEach(input => {
        const setting = input.dataset.security;
        if (input.type === 'checkbox') {
            input.checked = mockSecurityData[setting];
        } else {
            input.value = mockSecurityData[setting];
        }

        // Add change listeners
        input.addEventListener('change', async () => {
            const value = input.type === 'checkbox' ? input.checked : input.value;
            try {
                if (setting === 'twoFactorEnabled' && value) {
                    await setup2FA();
                } else {
                    await saveSecurity(setting, value);
                }
            } catch (error) {
                window.cloudStore.createNotification('Failed to update security setting', 'error');
            }
        });
    });

    updateSecurityDashboard(mockSecurityData);
}

// Setup 2FA
async function setup2FA() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Set Up Two-Factor Authentication</h3>
            <div class="space-y-4">
                <div class="flex justify-center">
                    <div class="bg-gray-100 p-4 rounded-lg">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/CloudStore:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=CloudStore" 
                             alt="2FA QR Code"
                             class="w-32 h-32">
                    </div>
                </div>
                <div class="text-sm text-gray-600 text-center">
                    Scan this QR code with your authenticator app
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Enter verification code</label>
                    <input type="text" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           maxlength="6"
                           pattern="[0-9]*"
                           inputmode="numeric"
                           placeholder="000000">
                </div>
            </div>
            <div class="flex justify-end mt-6 space-x-3">
                <button class="px-4 py-2 text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                    Cancel
                </button>
                <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onclick="verify2FACode(this)">
                    Verify & Enable
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Verify 2FA code
async function verify2FACode(button) {
    const input = button.closest('.bg-white').querySelector('input');
    const code = input.value.trim();

    if (!/^\d{6}$/.test(code)) {
        input.classList.add('border-red-500');
        return;
    }

    button.disabled = true;
    button.innerHTML = `
        <div class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Verifying...
        </div>
    `;

    try {
        // Simulate verification
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        window.cloudStore.createNotification('Two-factor authentication enabled successfully', 'success');
        button.closest('.fixed').remove();
        
        // Update toggle state
        const toggle = document.querySelector('[data-security="twoFactorEnabled"]');
        if (toggle) toggle.checked = true;
    } catch (error) {
        window.cloudStore.createNotification('Failed to verify code', 'error');
        button.disabled = false;
        button.textContent = 'Verify & Enable';
    }
}

// Generate backup codes
async function generateBackupCodes() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Backup Codes</h3>
            <div class="space-y-4">
                <p class="text-sm text-gray-500">
                    Save these backup codes in a secure place. Each code can only be used once.
                </p>
                <div class="bg-gray-100 p-4 rounded-lg grid grid-cols-2 gap-2">
                    ${generateRandomCodes(8).map(code => `
                        <div class="font-mono text-sm">${code}</div>
                    `).join('')}
                </div>
                <div class="flex justify-end space-x-3">
                    <button class="px-4 py-2 text-gray-500 hover:text-gray-700" onclick="downloadBackupCodes()">
                        Download
                    </button>
                    <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onclick="this.closest('.fixed').remove()">
                        Done
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Generate random backup codes
function generateRandomCodes(count) {
    const codes = [];
    for (let i = 0; i < count; i++) {
        codes.push(Math.random().toString(36).substr(2, 4).toUpperCase() + 
                  Math.random().toString(36).substr(2, 4).toUpperCase());
    }
    return codes;
}

// Download backup codes
function downloadBackupCodes() {
    const codes = Array.from(document.querySelectorAll('.font-mono'))
                      .map(el => el.textContent)
                      .join('\n');
    const blob = new Blob([codes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cloudstore-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Setup login history
function setupLoginHistory() {
    const container = document.getElementById('login-history');
    if (!container) return;

    const mockLogins = [
        {
            device: 'Chrome on Windows',
            location: 'Mexico City, Mexico',
            ip: '192.168.1.1',
            time: '2024-01-15T10:30:00Z',
            status: 'success'
        },
        {
            device: 'Safari on iPhone',
            location: 'Mexico City, Mexico',
            ip: '192.168.1.2',
            time: '2024-01-14T15:45:00Z',
            status: 'success'
        },
        {
            device: 'Firefox on Mac',
            location: 'Unknown Location',
            ip: '192.168.1.3',
            time: '2024-01-14T08:15:00Z',
            status: 'failed'
        }
    ];

    container.innerHTML = mockLogins.map(login => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <i class="fas fa-${getDeviceIcon(login.device)} text-gray-600"></i>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-900">${login.device}</p>
                    <p class="text-xs text-gray-500">${login.location} • ${login.ip}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm ${login.status === 'success' ? 'text-green-600' : 'text-red-600'}">
                    ${login.status === 'success' ? 'Success' : 'Failed'}
                </p>
                <p class="text-xs text-gray-500">${formatDate(login.time)}</p>
            </div>
        </div>
    `).join('');
}

// Setup device list
function setupDeviceList() {
    const container = document.getElementById('device-list');
    if (!container) return;

    const mockDevices = [
        {
            name: 'Windows PC - Chrome',
            lastActive: '2024-01-15T10:30:00Z',
            location: 'Mexico City, Mexico',
            current: true
        },
        {
            name: 'iPhone 12 - Safari',
            lastActive: '2024-01-14T15:45:00Z',
            location: 'Mexico City, Mexico',
            current: false
        },
        {
            name: 'MacBook Pro - Firefox',
            lastActive: '2024-01-13T08:15:00Z',
            location: 'Mexico City, Mexico',
            current: false
        }
    ];

    container.innerHTML = mockDevices.map(device => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <i class="fas fa-${getDeviceIcon(device.name)} text-gray-600"></i>
                </div>
                <div>
                    <div class="flex items-center">
                        <p class="text-sm font-medium text-gray-900">${device.name}</p>
                        ${device.current ? `
                            <span class="ml-2 px-2 py-0.5 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                                Current
                            </span>
                        ` : ''}
                    </div>
                    <p class="text-xs text-gray-500">${device.location} • Last active ${formatDate(device.lastActive)}</p>
                </div>
            </div>
            ${!device.current ? `
                <button class="text-red-600 hover:text-red-800" onclick="revokeDevice('${device.name}')">
                    Revoke Access
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Revoke device access
async function revokeDevice(deviceName) {
    if (!confirm(`Are you sure you want to revoke access for ${deviceName}?`)) return;

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const deviceElement = Array.from(document.querySelectorAll('#device-list > div'))
                                 .find(el => el.textContent.includes(deviceName));
        
        if (deviceElement) {
            deviceElement.classList.add('animate-fade-out');
            setTimeout(() => deviceElement.remove(), 300);
        }

        window.cloudStore.createNotification(`Access revoked for ${deviceName}`, 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to revoke device access', 'error');
    }
}

// Save security setting
async function saveSecurity(setting, value) {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.cloudStore.createNotification('Security setting updated successfully', 'success');
        
        // Update security dashboard if needed
        if (['passwordExpiry', 'autoLockDelay'].includes(setting)) {
            updateSecurityScore();
        }
    } catch (error) {
        throw new Error('Failed to save security setting');
    }
}

// Update security dashboard
function updateSecurityDashboard(data) {
    const scoreElement = document.getElementById('security-score');
    if (scoreElement) {
        scoreElement.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Security Score</span>
                <span class="text-lg font-bold ${getScoreColor(data.securityScore)}">
                    ${data.securityScore}%
                </span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full ${getScoreColor(data.securityScore)} transition-all duration-300"
                     style="width: ${data.securityScore}%"></div>
            </div>
        `;
    }
}

// Update security score
function updateSecurityScore() {
    const twoFactorEnabled = document.querySelector('[data-security="twoFactorEnabled"]')?.checked;
    const passwordExpiry = document.querySelector('[data-security="passwordExpiry"]')?.value;
    const autoLockDelay = document.querySelector('[data-security="autoLockDelay"]')?.value;

    let score = 0;
    if (twoFactorEnabled) score += 40;
    if (passwordExpiry !== 'never') score += 30;
    if (parseInt(autoLockDelay) <= 15) score += 30;

    updateSecurityDashboard({ securityScore: score });
}

// Helper functions
function getDeviceIcon(deviceName) {
    if (deviceName.toLowerCase().includes('iphone')) return 'mobile';
    if (deviceName.toLowerCase().includes('mac')) return 'laptop';
    return 'desktop';
}

function getScoreColor(score) {
    if (score >= 80) return 'bg-green-500 text-green-500';
    if (score >= 60) return 'bg-yellow-500 text-yellow-500';
    return 'bg-red-500 text-red-500';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60 * 1000) return 'Just now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} minutes ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} hours ago`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))} days ago`;
    return date.toLocaleDateString();
}

// Device sync
function setupDeviceSync() {
    const deviceToggles = document.querySelectorAll('[data-device]');
    deviceToggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            const setting = toggle.dataset.device;
            const enabled = toggle.checked;
            saveSettings('devices', { [setting]: enabled });

            if (setting === 'syncEnabled' && enabled) {
                registerServiceWorker();
            }
        });
    });
}

// Register service worker for sync
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/worker.js');
            await registration.sync.register('sync-files');
            window.cloudStore.createNotification('Device sync enabled', 'success');
        } catch (error) {
            window.cloudStore.createNotification('Failed to enable device sync', 'error');
        }
    }
}

// Load user preferences
function loadUserPreferences() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    document.querySelectorAll('[data-preference]').forEach(element => {
        const preference = element.dataset.preference;
        if (user[preference]) {
            if (element.tagName === 'INPUT') {
                if (element.type === 'checkbox') {
                    element.checked = user[preference];
                } else {
                    element.value = user[preference];
                }
            } else {
                element.textContent = user[preference];
            }
        }
    });
}

// Export settings
function exportSettings() {
    const settings = loadSettings();
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportEl = document.createElement('a');
    exportEl.setAttribute('href', dataUri);
    exportEl.setAttribute('download', 'cloudstore-settings.json');
    exportEl.click();
}

// Import settings
function importSettings(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const settings = JSON.parse(e.target.result);
            await saveSettings('', settings);
            window.cloudStore.createNotification('Settings imported successfully', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            window.cloudStore.createNotification('Failed to import settings', 'error');
        }
    };
    reader.readAsText(file);
}

// Reset settings
function resetSettings() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Reset Settings</h3>
            <p class="text-gray-500 mb-4">Are you sure you want to reset all settings to their default values? This action cannot be undone.</p>
            <div class="flex justify-end space-x-3">
                <button class="px-4 py-2 text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">Cancel</button>
                <button class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onclick="confirmResetSettings()">
                    Reset All Settings
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Confirm reset settings
async function confirmResetSettings() {
    try {
        localStorage.removeItem('settings');
        window.cloudStore.createNotification('Settings reset to defaults', 'success');
        setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
        window.cloudStore.createNotification('Failed to reset settings', 'error');
    }
}

// Utility function for animations
function animateTabContent(tab) {
    const elements = tab.querySelectorAll('.animate-slide-up, .animate-fade-in');
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

// Mobile menu handling
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');
const mobileSidebar = document.getElementById('mobile-sidebar');

mobileMenuButton?.addEventListener('click', () => {
    mobileSidebarOverlay?.classList.toggle('hidden');
    mobileSidebar?.classList.toggle('-translate-x-full');
});

mobileSidebarOverlay?.addEventListener('click', () => {
    mobileSidebarOverlay.classList.add('hidden');
    mobileSidebar?.classList.add('-translate-x-full');
});