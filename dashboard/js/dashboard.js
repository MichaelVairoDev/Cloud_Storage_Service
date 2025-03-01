// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupCharts();
    setupQuickActions();
    loadRecentActivities();
    setupFolderStats();
    initializeSearch();
    setupStorageWidgets();
    setupNotifications();
    initializeSharedFiles();
    setupActivityFeed();
});

// Initialize dashboard
async function initializeDashboard() {
    const mockData = {
        storage: {
            used: 8.5,
            total: 1024,
            files: 1234,
            shared: 56,
            distribution: {
                documents: 2.5,
                images: 4.2,
                videos: 1.8
            }
        },
        activities: [
            { type: 'upload', user: 'You', item: 'Project Proposal.pdf', time: '5 minutes ago' },
            { type: 'share', user: 'Alice Cooper', item: 'Marketing Assets', time: '2 hours ago' },
            { type: 'edit', user: 'Bob Wilson', item: 'Q4 Report.xlsx', time: '4 hours ago' }
        ]
    };

    updateUserInfo(mockData);
    updateStorageStats(mockData.storage);
    setupCollaborationFeatures();
}

// Update user info
function updateUserInfo(user) {
    const elements = {
        name: document.getElementById('userName'),
        email: document.getElementById('userEmail'),
        avatar: document.getElementById('userAvatar'),
        plan: document.getElementById('userPlan')
    };

    if (elements.name) elements.name.textContent = user.name;
    if (elements.email) elements.email.textContent = user.email;
    if (elements.avatar) elements.avatar.src = user.avatar;
    if (elements.plan) elements.plan.textContent = user.plan;
}

// Update storage statistics
function updateStorageStats(storage) {
    const usedSpace = document.getElementById('usedSpace');
    const totalSpace = document.getElementById('totalSpace');
    const storageProgress = document.getElementById('storageProgress');
    const filesCount = document.getElementById('filesCount');
    const sharedFiles = document.getElementById('sharedFiles');

    if (usedSpace) usedSpace.textContent = window.cloudStore.formatSize(storage.used * 1024 * 1024 * 1024);
    if (totalSpace) totalSpace.textContent = window.cloudStore.formatSize(storage.total * 1024 * 1024 * 1024);
    if (storageProgress) {
        const percentage = (storage.used / storage.total) * 100;
        storageProgress.style.width = `${percentage}%`;
        storageProgress.classList.toggle('bg-yellow-500', percentage > 75);
        storageProgress.classList.toggle('bg-red-500', percentage > 90);
    }
    if (filesCount) filesCount.textContent = storage.files.toLocaleString();
    if (sharedFiles) sharedFiles.textContent = storage.shared.toLocaleString();
}

// Setup charts using Chart.js
function setupCharts() {
    setupStorageChart();
    setupActivityChart();
    setupTrendChart();
}

// Setup storage distribution chart
function setupStorageChart() {
    const ctx = document.getElementById('storageChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Documents', 'Images', 'Videos', 'Others'],
            datasets: [{
                data: [30, 25, 20, 25],
                backgroundColor: [
                    '#3B82F6', // blue
                    '#10B981', // green
                    '#F59E0B', // yellow
                    '#6B7280'  // gray
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            cutout: '75%'
        }
    });
}

// Setup activity chart
function setupActivityChart() {
    const ctx = document.getElementById('activityChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Uploads',
                data: [12, 19, 15, 8, 22, 14, 10],
                borderColor: '#3B82F6',
                tension: 0.4
            }, {
                label: 'Downloads',
                data: [8, 15, 12, 6, 18, 10, 8],
                borderColor: '#10B981',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Setup trend chart
function setupTrendChart() {
    const ctx = document.getElementById('trendChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Storage Growth (GB)',
                data: [50, 80, 120, 160, 200, 250],
                backgroundColor: '#3B82F6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Setup quick actions
function setupQuickActions() {
    const actions = {
        upload: () => document.getElementById('fileInput')?.click(),
        newFolder: () => showCreateFolderDialog(),
        share: () => showShareDialog(),
        sync: () => syncFiles()
    };

    Object.entries(actions).forEach(([action, handler]) => {
        const button = document.querySelector(`[data-action="${action}"]`);
        button?.addEventListener('click', handler);
    });
}

// Show create folder dialog
function showCreateFolderDialog() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Create New Folder</h3>
            <input type="text" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Folder name">
            <div class="flex justify-end mt-6 space-x-3">
                <button class="px-4 py-2 text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                    Cancel
                </button>
                <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onclick="confirmCreateFolder(this)">
                    Create
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('input').focus();
}

// Confirm folder creation
function confirmCreateFolder(button) {
    const input = button.closest('.bg-white').querySelector('input');
    const folderName = input.value.trim();

    if (!folderName) {
        input.classList.add('border-red-500');
        return;
    }

    button.disabled = true;
    button.innerHTML = `
        <div class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Creating...
        </div>
    `;

    // Simulate folder creation
    setTimeout(() => {
        window.cloudStore.createNotification(`Folder "${folderName}" created successfully`, 'success');
        button.closest('.fixed').remove();
        refreshFolderList();
    }, 1000);
}

// Show share dialog
function showShareDialog() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4 animate-scale">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Share Multiple Files</h3>
            <div class="space-y-4">
                <div class="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                    <p class="text-sm text-gray-500">Drag and drop files here or click to select</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">People</label>
                    <input type="text" 
                           placeholder="Enter email addresses" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                    <textarea class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="3"></textarea>
                </div>
            </div>
            <div class="flex justify-end mt-6 space-x-3">
                <button class="px-4 py-2 text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">Cancel</button>
                <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onclick="shareFiles(this)">
                    Share
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Setup drag and drop
    const dropZone = modal.querySelector('.border-dashed');
    setupDropZone(dropZone);
}

// Setup drop zone
function setupDropZone(dropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('border-blue-500', 'bg-blue-50');
    }

    function unhighlight() {
        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }

    dropZone.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            handleFiles(files);
        });
        input.click();
    });
}

// Handle dropped/selected files
function handleFiles(files) {
    // Show selected files
    const dropZone = document.querySelector('.border-dashed');
    dropZone.innerHTML = files.map(file => `
        <div class="flex items-center justify-between py-2">
            <div class="flex items-center">
                <i class="fas ${window.fileOps.getFileIcon(file.name)} ${window.fileOps.getFileColor(file.name)} text-lg mr-2"></i>
                <span class="text-sm text-gray-900">${file.name}</span>
            </div>
            <span class="text-xs text-gray-500">${window.fileOps.formatSize(file.size)}</span>
        </div>
    `).join('');
}

// Share files
async function shareFiles(button) {
    const modal = button.closest('.bg-white');
    const emails = modal.querySelector('input[type="text"]').value;
    const message = modal.querySelector('textarea').value;

    if (!emails) {
        modal.querySelector('input[type="text"]').classList.add('border-red-500');
        return;
    }

    button.disabled = true;
    button.innerHTML = `
        <div class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Sharing...
        </div>
    `;

    try {
        // Simulate sharing
        await new Promise(resolve => setTimeout(resolve, 1500));
        window.cloudStore.createNotification('Files shared successfully', 'success');
        button.closest('.fixed').remove();
    } catch (error) {
        window.cloudStore.createNotification('Failed to share files', 'error');
        button.disabled = false;
        button.textContent = 'Share';
    }
}

// Sync files
async function syncFiles() {
    const button = document.querySelector('[data-action="sync"]');
    if (!button) return;

    const originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
        <div class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        </div>
    `;

    try {
        // Request sync from service worker
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-files');
        
        window.cloudStore.createNotification('Files synced successfully', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to sync files', 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = originalHtml;
    }
}

// Load recent activities
function loadRecentActivities() {
    const container = document.getElementById('recent-activities');
    if (!container) return;

    const activities = [
        {
            type: 'upload',
            user: 'You',
            action: 'uploaded',
            item: 'Project Presentation.pptx',
            time: '5 minutes ago',
            icon: 'fa-upload',
            color: 'text-blue-500'
        },
        {
            type: 'share',
            user: 'Alice Cooper',
            action: 'shared',
            item: 'Q4 Financial Report',
            time: '2 hours ago',
            icon: 'fa-share-alt',
            color: 'text-green-500'
        },
        {
            type: 'edit',
            user: 'Bob Wilson',
            action: 'edited',
            item: 'Marketing Strategy.docx',
            time: '4 hours ago',
            icon: 'fa-edit',
            color: 'text-yellow-500'
        }
    ];

    container.innerHTML = activities.map(activity => `
        <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full bg-${activity.color.replace('text-', 'bg-')} bg-opacity-10 flex items-center justify-center">
                    <i class="fas ${activity.icon} ${activity.color}"></i>
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900">
                    <span class="font-medium">${activity.user}</span>
                    ${activity.action}
                    <span class="font-medium">${activity.item}</span>
                </p>
                <p class="text-xs text-gray-500">${activity.time}</p>
            </div>
        </div>
    `).join('');
}

// Setup folder statistics
function setupFolderStats() {
    const mockFolders = [
        { name: 'Documents', files: 125, size: '2.5 GB', growth: 15 },
        { name: 'Images', files: 450, size: '4.2 GB', growth: 8 },
        { name: 'Videos', files: 32, size: '8.7 GB', growth: 25 },
        { name: 'Downloads', files: 78, size: '1.8 GB', growth: -5 }
    ];

    const container = document.getElementById('folder-stats');
    if (!container) return;

    container.innerHTML = mockFolders.map(folder => `
        <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-folder text-blue-500 text-xl"></i>
                    <h3 class="font-medium text-gray-900">${folder.name}</h3>
                </div>
                <span class="text-sm ${folder.growth >= 0 ? 'text-green-500' : 'text-red-500'}">
                    ${folder.growth >= 0 ? '+' : ''}${folder.growth}%
                </span>
            </div>
            <div class="flex justify-between text-sm text-gray-500">
                <span>${folder.files} files</span>
                <span>${folder.size}</span>
            </div>
        </div>
    `).join('');
}

// Setup storage widgets
function setupStorageWidgets() {
    setupStorageBreakdown();
    setupStorageAlerts();
    setupStorageTrends();
}

// Setup storage breakdown
function setupStorageBreakdown() {
    const container = document.getElementById('storage-breakdown');
    if (!container) return;

    const categories = [
        { name: 'Documents', size: '2.5 GB', percentage: 25, color: 'blue' },
        { name: 'Images', size: '4.2 GB', percentage: 42, color: 'green' },
        { name: 'Videos', size: '1.8 GB', percentage: 18, color: 'yellow' },
        { name: 'Others', size: '1.5 GB', percentage: 15, color: 'gray' }
    ];

    container.innerHTML = categories.map(category => `
        <div class="space-y-2">
            <div class="flex justify-between text-sm">
                <span class="text-gray-600">${category.name}</span>
                <span class="text-gray-900 font-medium">${category.size}</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-${category.color}-500 rounded-full" style="width: ${category.percentage}%"></div>
            </div>
        </div>
    `).join('');
}

// Setup collaboration features
function setupCollaborationFeatures() {
    setupSharedWithMe();
    setupTeamActivity();
    setupCollaborators();
}

// Setup shared with me section
function setupSharedWithMe() {
    const container = document.getElementById('shared-with-me');
    if (!container) return;

    const sharedItems = [
        {
            name: 'Q4 Financial Report',
            sharedBy: 'Alice Cooper',
            date: '2024-01-15',
            type: 'excel'
        },
        {
            name: 'Marketing Assets',
            sharedBy: 'Marketing Team',
            date: '2024-01-14',
            type: 'folder'
        },
        {
            name: 'Project Timeline',
            sharedBy: 'Bob Wilson',
            date: '2024-01-13',
            type: 'pdf'
        }
    ];

    container.innerHTML = sharedItems.map(item => `
        <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div class="flex items-center space-x-3">
                <i class="fas ${getFileIcon(item.type)} ${getFileColor(item.type)}"></i>
                <div>
                    <p class="text-sm font-medium text-gray-900">${item.name}</p>
                    <p class="text-xs text-gray-500">Shared by ${item.sharedBy} • ${formatDate(item.date)}</p>
                </div>
            </div>
            <button class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-ellipsis-v"></i>
            </button>
        </div>
    `).join('');
}

// Setup team activity feed
function setupTeamActivity() {
    const container = document.getElementById('team-activity');
    if (!container) return;

    const activities = [
        {
            user: 'Alice Cooper',
            action: 'commented on',
            item: 'Project Proposal',
            time: '5 minutes ago',
            avatar: 'AC'
        },
        {
            user: 'Bob Wilson',
            action: 'edited',
            item: 'Marketing Strategy',
            time: '2 hours ago',
            avatar: 'BW'
        },
        {
            user: 'Carol Johnson',
            action: 'uploaded',
            item: 'Team Photos',
            time: '4 hours ago',
            avatar: 'CJ'
        }
    ];

    container.innerHTML = activities.map(activity => `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
                <span class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500 text-white">
                    ${activity.avatar}
                </span>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900">
                    <span class="font-medium">${activity.user}</span>
                    ${activity.action}
                    <span class="font-medium">${activity.item}</span>
                </p>
                <p class="text-xs text-gray-500">${activity.time}</p>
            </div>
        </div>
    `).join('');
}

// Setup notifications
function setupNotifications() {
    const button = document.getElementById('notification-button');
    const container = document.getElementById('notification-container');
    if (!button || !container) return;

    const notifications = [
        {
            type: 'share',
            message: 'Alice Cooper shared "Marketing Plan" with you',
            time: '5 minutes ago',
            read: false
        },
        {
            type: 'comment',
            message: 'Bob Wilson commented on "Project Timeline"',
            time: '2 hours ago',
            read: false
        },
        {
            type: 'upload',
            message: 'File upload complete: "Presentation.pptx"',
            time: '4 hours ago',
            read: true
        }
    ];

    // Update notification badge
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
        button.innerHTML += `
            <span class="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                ${unreadCount}
            </span>
        `;
    }

    // Show notifications panel
    button.addEventListener('click', () => {
        container.innerHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
            <div class="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 animate-slide-left">
                <div class="p-4 border-b flex items-center justify-between">
                    <h3 class="text-lg font-medium text-gray-900">Notifications</h3>
                    <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-4 space-y-4">
                    ${notifications.map(notification => `
                        <div class="flex items-start space-x-3 p-3 ${notification.read ? 'bg-white' : 'bg-blue-50'} rounded-lg">
                            <div class="flex-shrink-0">
                                <i class="fas ${getNotificationIcon(notification.type)} text-blue-500"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm text-gray-900">${notification.message}</p>
                                <p class="text-xs text-gray-500">${notification.time}</p>
                            </div>
                            ${!notification.read ? `
                                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
}

// Initialize search
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });
}

// Perform search
async function performSearch(query) {
    if (!query) {
        hideSearchResults();
        return;
    }

    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock results
    const results = [
        {
            type: 'file',
            name: 'Project Presentation.pptx',
            location: 'Documents/Projects',
            modified: '2 days ago'
        },
        {
            type: 'folder',
            name: 'Marketing Assets',
            location: 'Documents',
            modified: '1 week ago'
        }
    ];

    showSearchResults(results);
}

// Show search results
function showSearchResults(results) {
    let resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'searchResults';
        resultsContainer.className = 'absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg mt-2 py-2 z-50';
        document.getElementById('searchContainer').appendChild(resultsContainer);
    }

    resultsContainer.innerHTML = results.map(result => `
        <div class="px-4 py-2 hover:bg-gray-50 cursor-pointer">
            <div class="flex items-center">
                <i class="fas ${result.type === 'file' ? 'fa-file' : 'fa-folder'} text-gray-400 mr-3"></i>
                <div>
                    <div class="text-sm font-medium text-gray-900">${result.name}</div>
                    <div class="text-xs text-gray-500">${result.location} · ${result.modified}</div>
                </div>
            </div>
        </div>
    `).join('') || '<div class="px-4 py-2 text-sm text-gray-500">No results found</div>';

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#searchContainer')) {
            hideSearchResults();
        }
    });
}

// Hide search results
function hideSearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
        resultsContainer.remove();
    }
}

// Refresh folder list
function refreshFolderList() {
    setupFolderStats();
}

// Helper functions
function getFileIcon(type) {
    const icons = {
        folder: 'fa-folder',
        pdf: 'fa-file-pdf',
        excel: 'fa-file-excel',
        word: 'fa-file-word',
        image: 'fa-file-image'
    };
    return icons[type] || 'fa-file';
}

function getFileColor(type) {
    const colors = {
        folder: 'text-blue-500',
        pdf: 'text-red-500',
        excel: 'text-green-500',
        word: 'text-blue-500',
        image: 'text-purple-500'
    };
    return colors[type] || 'text-gray-500';
}

function getNotificationIcon(type) {
    const icons = {
        share: 'fa-share-alt',
        comment: 'fa-comment',
        upload: 'fa-upload'
    };
    return icons[type] || 'fa-bell';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
        return 'Today';
    } else if (diff < 48 * 60 * 60 * 1000) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString();
    }
}