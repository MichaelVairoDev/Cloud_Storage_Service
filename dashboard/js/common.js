// Global store for application state and utilities
window.cloudStore = {
    // Notification system
    createNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50 animate-slide-up max-w-md`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };

        const colors = {
            success: 'text-green-500',
            error: 'text-red-500',
            info: 'text-blue-500',
            warning: 'text-yellow-500'
        };

        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${icons[type]} ${colors[type]} text-xl mr-3"></i>
                <div class="flex-1 pr-4">
                    <p class="text-sm font-medium text-gray-900">${message}</p>
                </div>
                <button class="text-gray-400 hover:text-gray-600 transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Handle close button
        const closeButton = notification.querySelector('button');
        closeButton.addEventListener('click', () => {
            notification.classList.add('animate-fade-out');
            setTimeout(() => notification.remove(), 300);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('animate-fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    },

    // Format file size
    formatSize: (bytes) => {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    },

    // Format date
    formatDate: (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 7) {
            return new Date(date).toLocaleDateString();
        } else if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    },

    // File type utilities
    getFileType: (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        const types = {
            pdf: { icon: 'file-pdf', color: 'text-red-500' },
            doc: { icon: 'file-word', color: 'text-blue-500' },
            docx: { icon: 'file-word', color: 'text-blue-500' },
            xls: { icon: 'file-excel', color: 'text-green-500' },
            xlsx: { icon: 'file-excel', color: 'text-green-500' },
            jpg: { icon: 'file-image', color: 'text-purple-500' },
            jpeg: { icon: 'file-image', color: 'text-purple-500' },
            png: { icon: 'file-image', color: 'text-purple-500' },
            gif: { icon: 'file-image', color: 'text-purple-500' },
            zip: { icon: 'file-archive', color: 'text-yellow-500' },
            rar: { icon: 'file-archive', color: 'text-yellow-500' },
            txt: { icon: 'file-alt', color: 'text-gray-500' }
        };

        return types[ext] || { icon: 'file', color: 'text-gray-500' };
    },

    // Create file preview
    createFilePreview: (file) => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            } else {
                const { icon, color } = cloudStore.getFileType(file.name);
                resolve(`<i class="fas fa-${icon} ${color} text-4xl"></i>`);
            }
        });
    },

    // Copy to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            cloudStore.createNotification('Copied to clipboard!', 'success');
        } catch (error) {
            cloudStore.createNotification('Failed to copy to clipboard', 'error');
        }
    },

    // Check online status
    checkOnlineStatus: () => {
        const updateOnlineStatus = () => {
            if (navigator.onLine) {
                cloudStore.createNotification('Back online!', 'success');
            } else {
                cloudStore.createNotification('You are offline. Some features may be limited.', 'warning');
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    },

    // Mobile sidebar handling
    initializeMobileSidebar: () => {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');
        const mobileSidebar = document.getElementById('mobile-sidebar');

        if (mobileMenuButton && mobileSidebarOverlay && mobileSidebar) {
            mobileMenuButton.addEventListener('click', () => {
                mobileSidebarOverlay.classList.toggle('hidden');
                mobileSidebar.classList.toggle('-translate-x-full');
            });

            mobileSidebarOverlay.addEventListener('click', () => {
                mobileSidebarOverlay.classList.add('hidden');
                mobileSidebar.classList.add('-translate-x-full');
            });
        }
    },

    // Theme handling
    initializeTheme: () => {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.classList.toggle('dark', theme === 'dark');

        const toggleTheme = () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            cloudStore.createNotification(`${isDark ? 'Dark' : 'Light'} theme activated`, 'success');
        };

        // Add theme toggle button if it exists
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    }
};

// Initialize common functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeLayout();
    setupGlobalSearch();
    setupNotifications();
    initializeTheme();
});

// Initialize layout
function initializeLayout() {
    setupSidebar();
    setupDropdowns();
    setupModals();
}

// Setup sidebar
function setupSidebar() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (mobileMenuButton && sidebar && overlay) {
        mobileMenuButton.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        });
    }

    // Active link highlighting
    const currentPath = window.location.pathname;
    document.querySelectorAll('#sidebar a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('bg-gray-100', 'text-blue-600');
        }
    });
}

// Setup dropdowns
function setupDropdowns() {
    document.querySelectorAll('[data-dropdown]').forEach(trigger => {
        const menu = document.getElementById(trigger.dataset.dropdown);
        if (!menu) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !trigger.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });
    });
}

// Setup modals
function setupModals() {
    document.querySelectorAll('[data-modal]').forEach(trigger => {
        const modal = document.getElementById(trigger.dataset.modal);
        if (!modal) return;

        trigger.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modal.querySelector('.animate-scale')?.classList.remove('animate-scale');
            setTimeout(() => {
                modal.querySelector('.bg-white')?.classList.add('animate-scale');
            }, 0);
        });

        modal.querySelectorAll('[data-close-modal]').forEach(closeButton => {
            closeButton.addEventListener('click', () => {
                modal.querySelector('.bg-white')?.classList.remove('animate-scale');
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 200);
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.querySelector('.bg-white')?.classList.remove('animate-scale');
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 200);
            }
        });
    });
}

// Setup global search
function setupGlobalSearch() {
    const searchContainer = document.getElementById('global-search');
    if (!searchContainer) return;

    const searchInput = searchContainer.querySelector('input');
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'hidden absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg mt-2 max-h-96 overflow-y-auto z-50';
    searchContainer.appendChild(resultsContainer);

    let searchTimeout;
    let lastQuery = '';

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (query === lastQuery) return;
        lastQuery = query;

        clearTimeout(searchTimeout);
        if (query.length < 2) {
            hideSearchResults();
            return;
        }

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });

    searchInput.addEventListener('focus', () => {
        if (lastQuery.length >= 2) {
            showSearchResults();
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            hideSearchResults();
        }
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (resultsContainer.classList.contains('hidden')) return;

        const activeItem = resultsContainer.querySelector('.bg-gray-100');
        const items = resultsContainer.querySelectorAll('[role="option"]');

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!activeItem) {
                    items[0]?.classList.add('bg-gray-100');
                } else {
                    const nextItem = activeItem.nextElementSibling;
                    if (nextItem) {
                        activeItem.classList.remove('bg-gray-100');
                        nextItem.classList.add('bg-gray-100');
                        nextItem.scrollIntoView({ block: 'nearest' });
                    }
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                if (activeItem) {
                    const prevItem = activeItem.previousElementSibling;
                    if (prevItem) {
                        activeItem.classList.remove('bg-gray-100');
                        prevItem.classList.add('bg-gray-100');
                        prevItem.scrollIntoView({ block: 'nearest' });
                    }
                }
                break;

            case 'Enter':
                e.preventDefault();
                if (activeItem) {
                    const url = activeItem.dataset.url;
                    if (url) window.location.href = url;
                }
                break;

            case 'Escape':
                e.preventDefault();
                hideSearchResults();
                break;
        }
    });
}

// Perform search
async function performSearch(query) {
    const resultsContainer = document.querySelector('#global-search > div');
    if (!resultsContainer) return;

    try {
        // Show loading state
        showSearchResults();
        resultsContainer.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            </div>
        `;

        // Simulate search delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock search results
        const results = [
            {
                type: 'file',
                name: 'Project Presentation.pptx',
                path: '/Documents/Projects',
                modified: '2 hours ago',
                icon: 'fa-file-powerpoint',
                color: 'text-red-500',
                url: '/dashboard/files/123'
            },
            {
                type: 'folder',
                name: 'Marketing Assets',
                path: '/Documents',
                modified: '1 day ago',
                icon: 'fa-folder',
                color: 'text-blue-500',
                url: '/dashboard/files/456'
            }
        ].filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.path.toLowerCase().includes(query.toLowerCase())
        );

        updateSearchResults(results);

    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                Failed to load search results
            </div>
        `;
    }
}

// Update search results
function updateSearchResults(results) {
    const resultsContainer = document.querySelector('#global-search > div');
    if (!resultsContainer) return;

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                No results found
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = `
        <div class="py-2">
            ${results.map((result, index) => `
                <div class="px-4 py-2 hover:bg-gray-50 cursor-pointer ${index === 0 ? 'bg-gray-100' : ''}"
                     role="option"
                     data-url="${result.url}"
                     tabindex="0">
                    <div class="flex items-center">
                        <i class="fas ${result.icon} ${result.color} text-lg mr-3"></i>
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-medium text-gray-900 truncate">${result.name}</div>
                            <div class="text-xs text-gray-500 truncate">${result.path}</div>
                        </div>
                        <div class="text-xs text-gray-500 ml-4">${result.modified}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Add click handlers
    resultsContainer.querySelectorAll('[role="option"]').forEach(item => {
        item.addEventListener('click', () => {
            window.location.href = item.dataset.url;
        });

        item.addEventListener('mouseenter', () => {
            resultsContainer.querySelector('.bg-gray-100')?.classList.remove('bg-gray-100');
            item.classList.add('bg-gray-100');
        });
    });
}

// Show search results
function showSearchResults() {
    const resultsContainer = document.querySelector('#global-search > div');
    if (resultsContainer) {
        resultsContainer.classList.remove('hidden');
    }
}

// Hide search results
function hideSearchResults() {
    const resultsContainer = document.querySelector('#global-search > div');
    if (resultsContainer) {
        resultsContainer.classList.add('hidden');
    }
}

// Setup notifications
function setupNotifications() {
    const container = document.createElement('div');
    container.id = 'notifications';
    container.className = 'fixed bottom-4 right-4 space-y-2 z-50';
    document.body.appendChild(container);

    window.cloudStore = window.cloudStore || {};
    window.cloudStore.createNotification = (message, type = 'info') => {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const notification = document.createElement('div');
        notification.className = `${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up`;
        notification.innerHTML = message;

        container.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('animate-fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };
}

// Initialize theme
function initializeTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = theme === 'dark';
        themeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
        });
    }
}

// Utility functions
window.cloudStore = window.cloudStore || {};

window.cloudStore.formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

window.cloudStore.formatSize = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Export common functionality
export {
    setupGlobalSearch,
    setupNotifications,
    initializeTheme
};

// Mobile menu handling
document.addEventListener('DOMContentLoaded', () => {
    initializeMobileMenu();
    initializeDropdowns();
    initializeAnimations();
    setupAuthButtons();
    initializeNotifications();
    initializeUserStatus();
    initializeTheme();
});

// Mobile menu initialization
function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-sidebar-overlay');

    if (!mobileMenuButton || !mobileSidebar || !overlay) return;

    mobileMenuButton.addEventListener('click', () => {
        mobileSidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    });

    overlay.addEventListener('click', () => {
        mobileSidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    });

    // Clone desktop sidebar content for mobile
    const desktopSidebar = document.querySelector('aside.hidden.md\\:flex');
    if (desktopSidebar && mobileSidebar.children.length === 0) {
        mobileSidebar.innerHTML = desktopSidebar.innerHTML;
    }
}

// Dropdown menus
function initializeDropdowns() {
    const dropdownTriggers = document.querySelectorAll('[data-dropdown]');
    dropdownTriggers.forEach(trigger => {
        const menu = document.getElementById(trigger.dataset.dropdown);
        if (!menu) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
            menu.classList.add('animate-scale');
        });

        // Close when clicking outside
        document.addEventListener('click', () => {
            menu.classList.add('hidden');
        });
    });
}

// Global animations
function initializeAnimations() {
    // Fade in elements with animation classes
    const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up, .animate-slide-down');
    animatedElements.forEach(el => {
        if (el.classList.contains('animate-fade-in')) {
            el.style.opacity = '0';
            setTimeout(() => {
                el.style.transition = 'opacity 0.5s ease-out';
                el.style.opacity = '1';
            }, 100);
        }
    });

    // Add hover animations to cards
    const cards = document.querySelectorAll('.hover-card');
    cards.forEach(card => {
        card.addEventListener('mouseover', () => {
            card.classList.add('transform', 'scale-[1.02]', 'shadow-md');
        });
        card.addEventListener('mouseout', () => {
            card.classList.remove('transform', 'scale-[1.02]', 'shadow-md');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Auth button handling
function setupAuthButtons() {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const signOutButton = document.getElementById('signOutButton');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userPlan = document.getElementById('userPlan');

    if (user) {
        // User is logged in
        if (loginLink) loginLink.classList.add('hidden');
        if (registerLink) registerLink.classList.add('hidden');
        if (signOutButton) {
            signOutButton.classList.remove('hidden');
            signOutButton.addEventListener('click', () => {
                localStorage.removeItem('user');
                window.location.href = '/login.html';
            });
        }
        
        // Update user info
        if (userAvatar) userAvatar.src = user.avatar;
        if (userName) userName.textContent = user.name;
        if (userPlan) userPlan.textContent = user.plan;
    } else {
        // User is not logged in
        if (signOutButton) signOutButton.classList.add('hidden');
        if (loginLink) loginLink.classList.remove('hidden');
        if (registerLink) registerLink.classList.remove('hidden');
    }
}

// Notifications system
const initializeNotifications = () => {
    const notificationButton = document.querySelector('.fa-bell')?.parentElement;
    let notificationCount = 0;

    window.cloudStore.createNotification = (message, type = 'info') => {
        // Update notification counter
        if (notificationButton) {
            notificationCount++;
            const existingDot = notificationButton.querySelector('.notification-dot');
            if (!existingDot) {
                const dot = document.createElement('div');
                dot.className = 'notification-dot absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs';
                dot.textContent = notificationCount;
                notificationButton.classList.add('relative');
                notificationButton.appendChild(dot);
            } else {
                existingDot.textContent = notificationCount;
            }
        }

        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-notification`;
        
        if (type === 'error') {
            toast.classList.add('bg-red-500');
        } else if (type === 'success') {
            toast.classList.add('bg-green-500');
        }

        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };
};

// User status indicator
const initializeUserStatus = () => {
    const updateLastActive = () => {
        localStorage.setItem('lastActive', new Date().toISOString());
    };

    // Update last active time every minute
    setInterval(updateLastActive, 60000);
    window.addEventListener('mousemove', updateLastActive);
    window.addEventListener('keydown', updateLastActive);
};

// Theme handling
const initializeTheme = () => {
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = (e) => {
        document.documentElement.classList.toggle('dark', e.matches);
    };

    systemDarkMode.addListener(updateTheme);
    updateTheme(systemDarkMode);
};

// Add custom styles for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1); }
    }
    .animate-notification {
        animation: slideUp 0.3s ease-out forwards;
    }
    .fade-out {
        opacity: 0;
        transition: opacity 0.3s ease-out;
    }
`;
document.head.appendChild(style);

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/dashboard/js/worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
                
                // Request notification permission
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY'
                        });
                    }
                });
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}