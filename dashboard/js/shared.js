// Modal handling
const shareModal = document.getElementById('share-modal');
const shareButtons = document.querySelectorAll('.fa-ellipsis-v');
const closeModalButton = shareModal.querySelector('.fa-times').parentElement;
const cancelButton = shareModal.querySelector('button:not(.bg-blue-500)');

// Show modal
shareButtons.forEach(button => {
    button.parentElement.addEventListener('click', () => {
        shareModal.classList.remove('hidden');
    });
});

// Close modal
[closeModalButton, cancelButton].forEach(button => {
    button.addEventListener('click', () => {
        shareModal.classList.add('hidden');
    });
});

// Close modal when clicking outside
shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) {
        shareModal.classList.add('hidden');
    }
});

// Tab switching
const sharedWithMeTab = document.querySelector('a[href="#shared-with-me"]');
const sharedByMeTab = document.querySelector('a[href="#shared-by-me"]');
const sharedWithMeContent = document.getElementById('shared-with-me');
const sharedByMeContent = document.getElementById('shared-by-me');

// Initialize tabs
const initializeTabs = () => {
    sharedWithMeContent?.classList.remove('hidden');
    sharedByMeContent?.classList.add('hidden');
    sharedWithMeTab?.classList.add('border-blue-500', 'text-blue-600');
    sharedWithMeTab?.classList.remove('border-transparent', 'text-gray-500');
};

// Tab click handlers
sharedWithMeTab?.addEventListener('click', (e) => {
    e.preventDefault();
    sharedByMeTab?.classList.remove('border-blue-500', 'text-blue-600');
    sharedByMeTab?.classList.add('border-transparent', 'text-gray-500');
    sharedWithMeTab?.classList.remove('border-transparent', 'text-gray-500');
    sharedWithMeTab?.classList.add('border-blue-500', 'text-blue-600');
    sharedWithMeContent?.classList.remove('hidden');
    sharedByMeContent?.classList.add('hidden');
});

sharedByMeTab?.addEventListener('click', (e) => {
    e.preventDefault();
    sharedWithMeTab?.classList.remove('border-blue-500', 'text-blue-600');
    sharedWithMeTab?.classList.add('border-transparent', 'text-gray-500');
    sharedByMeTab?.classList.remove('border-transparent', 'text-gray-500');
    sharedByMeTab?.classList.add('border-blue-500', 'text-blue-600');
    sharedByMeContent?.classList.remove('hidden');
    sharedWithMeContent?.classList.add('hidden');
});

// Share functionality
const shareButtons = document.querySelectorAll('.fa-share-alt');
const shareModal = document.getElementById('share-modal');
const closeModalButtons = document.querySelectorAll('#share-modal button:not(.bg-blue-500)');

shareButtons.forEach(button => {
    button.parentElement.addEventListener('click', () => {
        shareModal?.classList.remove('hidden');
    });
});

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        shareModal?.classList.add('hidden');
    });
});

// Copy share link
const copyLinkButtons = document.querySelectorAll('.fa-link');
copyLinkButtons.forEach(button => {
    button.parentElement.addEventListener('click', () => {
        const dummyLink = 'https://cloudstore.com/shared/xyz123';
        navigator.clipboard.writeText(dummyLink).then(() => {
            window.cloudStore.createNotification('Share link copied to clipboard');
        });
    });
});

// Access level change
const accessSelects = document.querySelectorAll('select');
accessSelects.forEach(select => {
    select.addEventListener('change', (e) => {
        const newAccess = e.target.value;
        const userName = e.target.closest('tr').querySelector('.text-gray-900').textContent;
        
        if (newAccess === 'Remove') {
            if (confirm(`Remove access for ${userName}?`)) {
                e.target.closest('tr').remove();
                window.cloudStore.createNotification(`Removed access for ${userName}`);
            } else {
                e.target.value = 'Can edit';
            }
        } else {
            window.cloudStore.createNotification(`Changed ${userName}'s access to "${newAccess}"`);
        }
    });
});

// Search functionality
const searchInput = document.querySelector('input[type="search"]');
searchInput?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const fileRows = document.querySelectorAll('tbody tr');
    
    fileRows.forEach(row => {
        const fileName = row.querySelector('.text-gray-900')?.textContent.toLowerCase();
        const sharedBy = row.querySelector('.flex .text-gray-900')?.textContent.toLowerCase();
        
        if (!fileName && !sharedBy) return;
        
        if (fileName?.includes(searchTerm) || sharedBy?.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSharedTabs();
    initializeShares();
    initializeShareModal();
    initializeSearchAndFilter();
    initializeSharedFiles();
    setupSharingModal();
    initializeCollaboration();
    setupFilters();
});

// Initialize shared tabs with animations
function initializeSharedTabs() {
    const sharedWithMeTab = document.querySelector('a[href="#shared-with-me"]');
    const sharedByMeTab = document.querySelector('a[href="#shared-by-me"]');
    const sharedWithMeContent = document.getElementById('shared-with-me');
    const sharedByMeContent = document.getElementById('shared-by-me');

    if (!sharedWithMeTab || !sharedByMeTab) return;

    // Show initial content with animation
    showTab('shared-with-me');

    sharedWithMeTab.addEventListener('click', (e) => {
        e.preventDefault();
        showTab('shared-with-me');
    });

    sharedByMeTab.addEventListener('click', (e) => {
        e.preventDefault();
        showTab('shared-by-me');
    });

    function showTab(tabId) {
        // Update tab styles
        [sharedWithMeTab, sharedByMeTab].forEach(tab => {
            const isActive = tab.getAttribute('href') === `#${tabId}`;
            tab.classList.toggle('border-blue-500', isActive);
            tab.classList.toggle('text-blue-600', isActive);
            tab.classList.toggle('border-transparent', !isActive);
            tab.classList.toggle('text-gray-500', !isActive);
        });

        // Animate content switch
        [sharedWithMeContent, sharedByMeContent].forEach(content => {
            if (!content) return;
            if (content.id === tabId) {
                content.classList.remove('hidden');
                animateContent(content);
            } else {
                content.classList.add('hidden');
            }
        });
    }
}

// Animate shared items
function animateContent(container) {
    const items = container.querySelectorAll('tr');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.3s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Initialize shares management
function initializeShares() {
    document.querySelectorAll('tbody tr').forEach(row => {
        // Add hover effect
        row.classList.add('hover:bg-gray-50', 'transition-all', 'duration-200');
        
        // Add click animation
        row.addEventListener('click', () => {
            row.classList.add('scale-[0.99]');
            setTimeout(() => row.classList.remove('scale-[0.99]'), 100);
        });

        // Setup access level changes
        const accessSelect = row.querySelector('select');
        if (accessSelect) {
            const originalValue = accessSelect.value;
            
            accessSelect.addEventListener('change', async (e) => {
                const newAccess = e.target.value;
                const userName = row.querySelector('.text-gray-900').textContent;
                
                if (newAccess === 'Remove') {
                    if (await confirmDialog(`Remove access for ${userName}?`)) {
                        row.style.opacity = '0';
                        row.style.transform = 'translateX(20px)';
                        setTimeout(() => row.remove(), 300);
                        window.cloudStore.createNotification(`Removed access for ${userName}`, 'success');
                    } else {
                        e.target.value = originalValue;
                    }
                } else {
                    window.cloudStore.createNotification(`Changed ${userName}'s access to "${newAccess}"`, 'success');
                }
            });
        }

        // Setup action buttons
        const actionButtons = row.querySelectorAll('button');
        actionButtons.forEach(button => {
            button.classList.add('transition-colors', 'duration-200');
            
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = button.querySelector('i').classList.contains('fa-link') ? 'copy' : 'menu';
                
                if (action === 'copy') {
                    const link = `https://cloudstore.com/share/${row.dataset.id || 'demo'}`;
                    navigator.clipboard.writeText(link);
                    window.cloudStore.createNotification('Share link copied to clipboard', 'success');
                }
            });
        });
    });
}

// Initialize share modal
function initializeShareModal() {
    const modal = document.getElementById('share-modal');
    const triggers = document.querySelectorAll('.fa-share-alt');
    const closeButtons = modal?.querySelectorAll('button:not(.bg-blue-500)');

    if (!modal || !triggers.length) return;

    triggers.forEach(trigger => {
        trigger.parentElement.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modal.querySelector('.animate-scale')?.classList.remove('animate-scale');
            setTimeout(() => {
                modal.querySelector('.bg-white')?.classList.add('animate-scale');
            }, 0);
        });
    });

    closeButtons?.forEach(button => {
        button.addEventListener('click', () => {
            modal.querySelector('.bg-white')?.classList.remove('animate-scale');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 200);
        });
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.querySelector('.bg-white')?.classList.remove('animate-scale');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 200);
        }
    });
}

// Initialize search and filter functionality
function initializeSearchAndFilter() {
    const searchInput = document.querySelector('input[type="search"]');
    searchInput?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const fileName = row.querySelector('.text-gray-900')?.textContent.toLowerCase();
            const sharedBy = row.querySelector('.flex .text-gray-900')?.textContent.toLowerCase();
            
            if (!fileName && !sharedBy) return;
            
            const matches = fileName?.includes(searchTerm) || sharedBy?.includes(searchTerm);
            row.style.display = matches ? '' : 'none';
        });
    });
}

// Utility function for confirmation dialogs
function confirmDialog(message) {
    return new Promise(resolve => {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        dialog.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-sm w-full animate-scale">
                <p class="text-gray-800 mb-4">${message}</p>
                <div class="flex justify-end space-x-3">
                    <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cancel">
                        Cancel
                    </button>
                    <button class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors confirm">
                        Remove
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('.cancel').addEventListener('click', () => {
            dialog.remove();
            resolve(false);
        });

        dialog.querySelector('.confirm').addEventListener('click', () => {
            dialog.remove();
            resolve(true);
        });
    });
}

// Initialize shared files list
function initializeSharedFiles() {
    const mockSharedFiles = [
        {
            id: '1',
            name: 'Project Proposal.pdf',
            sharedBy: 'Alice Cooper',
            sharedDate: '2024-01-15T10:30:00',
            type: 'pdf',
            size: 2500000,
            permissions: 'view'
        },
        {
            id: '2',
            name: 'Marketing Strategy.docx',
            sharedBy: 'Bob Wilson',
            sharedDate: '2024-01-14T15:45:00',
            type: 'word',
            size: 1800000,
            permissions: 'edit'
        },
        {
            id: '3',
            name: 'Budget 2024.xlsx',
            sharedBy: 'Charlie Brown',
            sharedDate: '2024-01-13T09:15:00',
            type: 'excel',
            size: 3200000,
            permissions: 'edit'
        }
    ];

    const sharedFilesList = document.getElementById('shared-files');
    if (!sharedFilesList) return;

    sharedFilesList.innerHTML = mockSharedFiles.map(file => `
        <tr class="hover:bg-gray-50 transition-colors animate-fade-in">
            <td class="py-4 px-6 whitespace-nowrap">
                <div class="flex items-center">
                    <i class="fas ${getFileIcon(file.type)} ${getFileColor(file.type)} text-lg mr-3"></i>
                    <div>
                        <div class="text-sm font-medium text-gray-900">${file.name}</div>
                        <div class="text-sm text-gray-500">Shared by ${file.sharedBy}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-500">${window.cloudStore.formatDate(file.sharedDate)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-500">${window.cloudStore.formatSize(file.size)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${file.permissions === 'edit' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                    ${file.permissions === 'edit' ? 'Can Edit' : 'Can View'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-3">
                    <button class="text-gray-400 hover:text-gray-600" onclick="downloadFile('${file.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                    ${file.permissions === 'edit' ? `
                        <button class="text-gray-400 hover:text-gray-600" onclick="editFile('${file.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : ''}
                    <button class="text-gray-400 hover:text-gray-600" onclick="showFileMenu(this, '${file.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Setup sharing modal
function setupSharingModal() {
    const modal = document.createElement('div');
    modal.id = 'sharing-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Share File</h3>
                <button class="text-gray-400 hover:text-gray-600" onclick="closeSharingModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">People</label>
                    <div class="mt-1 relative">
                        <input type="text" 
                               class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                               placeholder="Enter email addresses">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Permission</label>
                    <select class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        <option value="view">Can view</option>
                        <option value="edit">Can edit</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Message (optional)</label>
                    <textarea class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              rows="3"
                              placeholder="Add a message"></textarea>
                </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800" onclick="closeSharingModal()">
                    Cancel
                </button>
                <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md" onclick="shareFile()">
                    Share
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Initialize real-time collaboration
function initializeCollaboration() {
    // Simulate WebSocket connection for real-time updates
    let wsConnection = null;

    function connectWebSocket() {
        // In a real implementation, this would connect to your WebSocket server
        console.log('Connecting to WebSocket server...');
        
        // Simulate connection events
        setTimeout(() => {
            console.log('WebSocket connected');
            setupCollaborationHandlers();
        }, 1000);
    }

    function setupCollaborationHandlers() {
        // Simulate receiving real-time updates
        const mockUpdates = [
            { type: 'edit', fileId: '2', user: 'Bob Wilson', action: 'edited Marketing Strategy.docx' },
            { type: 'comment', fileId: '1', user: 'Alice Cooper', action: 'commented on Project Proposal.pdf' }
        ];

        mockUpdates.forEach((update, index) => {
            setTimeout(() => {
                showCollaborationUpdate(update);
            }, (index + 1) * 5000);
        });
    }

    // Connect on page load
    connectWebSocket();
}

// Setup filters for shared files
function setupFilters() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            
            // Update active filter
            filterButtons.forEach(btn => {
                btn.classList.toggle('bg-blue-50', btn === button);
                btn.classList.toggle('text-blue-600', btn === button);
            });

            // Filter files (mock implementation)
            filterSharedFiles(filter);
        });
    });
}

// Helper functions
function getFileIcon(type) {
    const icons = {
        pdf: 'fa-file-pdf',
        word: 'fa-file-word',
        excel: 'fa-file-excel',
        image: 'fa-file-image',
        video: 'fa-file-video'
    };
    return icons[type] || 'fa-file';
}

function getFileColor(type) {
    const colors = {
        pdf: 'text-red-500',
        word: 'text-blue-500',
        excel: 'text-green-500',
        image: 'text-purple-500',
        video: 'text-yellow-500'
    };
    return colors[type] || 'text-gray-500';
}

function showFileMenu(button, fileId) {
    const existingMenu = document.querySelector('.file-context-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    const menu = document.createElement('div');
    menu.className = 'file-context-menu absolute bg-white rounded-lg shadow-lg py-2 z-50 animate-scale';
    menu.innerHTML = `
        <button class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center" onclick="downloadFile('${fileId}')">
            <i class="fas fa-download w-5"></i>
            <span>Download</span>
        </button>
        <button class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center" onclick="showSharingModal('${fileId}')">
            <i class="fas fa-share-alt w-5"></i>
            <span>Share</span>
        </button>
        <button class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center" onclick="showFileDetails('${fileId}')">
            <i class="fas fa-info-circle w-5"></i>
            <span>Details</span>
        </button>
        <hr class="my-2">
        <button class="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 flex items-center" onclick="removeSharing('${fileId}')">
            <i class="fas fa-times-circle w-5"></i>
            <span>Remove</span>
        </button>
    `;

    const rect = button.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;

    document.body.appendChild(menu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !button.contains(e.target)) {
            menu.remove();
        }
    });
}

function downloadFile(fileId) {
    // Simulate file download
    window.cloudStore.createNotification('Downloading file...', 'info');
    setTimeout(() => {
        window.cloudStore.createNotification('File downloaded successfully', 'success');
    }, 2000);
}

function editFile(fileId) {
    // Redirect to editor
    window.location.href = `/editor.html?file=${fileId}`;
}

function showSharingModal(fileId) {
    const modal = document.getElementById('sharing-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.dataset.fileId = fileId;
    }
}

function closeSharingModal() {
    const modal = document.getElementById('sharing-modal');
    if (modal) {
        modal.classList.add('animate-fade-out');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('animate-fade-out');
        }, 300);
    }
}

function shareFile() {
    const modal = document.getElementById('sharing-modal');
    const fileId = modal.dataset.fileId;
    const emailInput = modal.querySelector('input[type="text"]');
    const permissionSelect = modal.querySelector('select');
    const messageTextarea = modal.querySelector('textarea');

    // Simulate sharing
    window.cloudStore.createNotification('Sharing file...', 'info');
    setTimeout(() => {
        window.cloudStore.createNotification('File shared successfully', 'success');
        closeSharingModal();
    }, 1000);
}

function showFileDetails(fileId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 animate-scale">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-medium text-gray-900">File Details</h3>
                <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-900 mb-2">Activity</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Last modified</span>
                            <span class="text-gray-900">2 hours ago</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Created</span>
                            <span class="text-gray-900">Jan 15, 2024</span>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-900 mb-2">Sharing</h4>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <img class="h-8 w-8 rounded-full mr-3" src="https://ui-avatars.com/api/?name=Alice+Cooper" alt="">
                                <div class="text-sm">
                                    <p class="font-medium text-gray-900">Alice Cooper</p>
                                    <p class="text-gray-500">Owner</p>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <img class="h-8 w-8 rounded-full mr-3" src="https://ui-avatars.com/api/?name=Bob+Wilson" alt="">
                                <div class="text-sm">
                                    <p class="font-medium text-gray-900">Bob Wilson</p>
                                    <p class="text-gray-500">Can edit</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function removeSharing(fileId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Remove Shared Access</h3>
            <p class="text-gray-500 mb-4">Are you sure you want to remove your access to this file? You will no longer be able to view or edit it.</p>
            <div class="flex justify-end space-x-3">
                <button class="px-4 py-2 text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">Cancel</button>
                <button class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" 
                        onclick="confirmRemoveSharing('${fileId}', this)">
                    Remove Access
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmRemoveSharing(fileId, button) {
    button.disabled = true;
    button.innerHTML = `
        <div class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Removing...
        </div>
    `;

    // Simulate removal
    setTimeout(() => {
        window.cloudStore.createNotification('Access removed successfully', 'success');
        button.closest('.fixed').remove();
        const fileRow = document.querySelector(`tr[data-file-id="${fileId}"]`);
        if (fileRow) {
            fileRow.classList.add('animate-fade-out');
            setTimeout(() => fileRow.remove(), 300);
        }
    }, 1000);
}

function filterSharedFiles(filter) {
    const files = document.querySelectorAll('#shared-files tr');
    files.forEach(file => {
        const permissions = file.querySelector('.rounded-full').textContent.trim().toLowerCase();
        const shouldShow = filter === 'all' || 
                          (filter === 'owned' && permissions === 'owner') ||
                          (filter === 'shared' && permissions !== 'owner');
        
        file.classList.toggle('hidden', !shouldShow);
    });
}

function showCollaborationUpdate(update) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50 animate-slide-up';
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="flex-shrink-0">
                <i class="fas ${update.type === 'edit' ? 'fa-edit text-blue-500' : 'fa-comment text-green-500'} text-lg"></i>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">${update.user}</p>
                <p class="text-sm text-gray-500">${update.action}</p>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeSharedView();
    setupShareModal();
    setupAccessControls();
    loadSharedItems();
    setupCollaboration();
});

// Initialize shared view
function initializeSharedView() {
    setupViewToggle();
    setupSortingOptions();
    setupBulkActions();
}

// Setup view toggle (grid/list)
function setupViewToggle() {
    const viewToggle = document.querySelector('[data-view-toggle]');
    const itemsContainer = document.getElementById('shared-items');
    
    if (viewToggle && itemsContainer) {
        const savedView = localStorage.getItem('sharedViewMode') || 'grid';
        itemsContainer.classList.toggle('grid-view', savedView === 'grid');
        itemsContainer.classList.toggle('list-view', savedView === 'list');
        
        viewToggle.addEventListener('click', () => {
            const isGrid = itemsContainer.classList.toggle('grid-view');
            itemsContainer.classList.toggle('list-view', !isGrid);
            localStorage.setItem('sharedViewMode', isGrid ? 'grid' : 'list');
        });
    }
}

// Setup sorting options
function setupSortingOptions() {
    const sortSelect = document.querySelector('[data-sort]');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', () => {
        const [property, direction] = sortSelect.value.split('-');
        sortItems(property, direction);
    });
}

// Sort items
function sortItems(property, direction) {
    const container = document.getElementById('shared-items');
    if (!container) return;

    const items = Array.from(container.children);
    
    items.sort((a, b) => {
        const aValue = a.dataset[property];
        const bValue = b.dataset[property];
        
        if (property === 'date') {
            return direction === 'asc' 
                ? new Date(aValue) - new Date(bValue)
                : new Date(bValue) - new Date(aValue);
        }
        
        return direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
    });

    container.innerHTML = '';
    items.forEach(item => container.appendChild(item));
}

// Setup bulk actions
function setupBulkActions() {
    const selectAllCheckbox = document.querySelector('[data-select-all]');
    const bulkActionsMenu = document.getElementById('bulk-actions');
    
    if (selectAllCheckbox && bulkActionsMenu) {
        selectAllCheckbox.addEventListener('change', () => {
            const checked = selectAllCheckbox.checked;
            document.querySelectorAll('[data-item-checkbox]')
                .forEach(checkbox => {
                    checkbox.checked = checked;
                    updateItemSelection(checkbox);
                });
            updateBulkActionsVisibility();
        });

        // Individual item selection
        document.addEventListener('change', (e) => {
            if (e.target.matches('[data-item-checkbox]')) {
                updateItemSelection(e.target);
                updateBulkActionsVisibility();
            }
        });
    }
}

// Update item selection
function updateItemSelection(checkbox) {
    const item = checkbox.closest('[data-item]');
    if (item) {
        item.classList.toggle('selected', checkbox.checked);
    }
}

// Update bulk actions visibility
function updateBulkActionsVisibility() {
    const selectedCount = document.querySelectorAll('[data-item-checkbox]:checked').length;
    const bulkActions = document.getElementById('bulk-actions');
    
    if (bulkActions) {
        bulkActions.classList.toggle('hidden', selectedCount === 0);
        const countBadge = bulkActions.querySelector('.count');
        if (countBadge) {
            countBadge.textContent = selectedCount;
        }
    }
}

// Setup share modal
function setupShareModal() {
    const modal = document.getElementById('share-modal');
    if (!modal) return;

    // Share button click handlers
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-share-button]')) {
            const itemId = e.target.closest('[data-item]').dataset.id;
            openShareModal(itemId);
        }
    });

    // Close modal
    modal.querySelectorAll('[data-close-modal]').forEach(button => {
        button.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    });

    // Share link copy
    const copyLinkButton = modal.querySelector('[data-copy-link]');
    if (copyLinkButton) {
        copyLinkButton.addEventListener('click', () => {
            const linkInput = modal.querySelector('[data-share-link]');
            if (linkInput) {
                window.cloudStore.copyToClipboard(linkInput.value);
            }
        });
    }

    // Access level change
    const accessSelect = modal.querySelector('[data-access-level]');
    if (accessSelect) {
        accessSelect.addEventListener('change', async () => {
            const itemId = modal.dataset.itemId;
            const accessLevel = accessSelect.value;
            await updateAccessLevel(itemId, accessLevel);
        });
    }
}

// Open share modal
async function openShareModal(itemId) {
    const modal = document.getElementById('share-modal');
    if (!modal) return;

    modal.dataset.itemId = itemId;
    modal.classList.remove('hidden');

    // Show loading state
    const content = modal.querySelector('.modal-content');
    content.innerHTML = `
        <div class="flex items-center justify-center p-8">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
    `;

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock share data
        const shareData = {
            link: `https://cloudstore.com/share/${itemId}`,
            accessLevel: 'view',
            collaborators: [
                {
                    id: 1,
                    name: 'Alice Cooper',
                    email: 'alice@example.com',
                    access: 'edit',
                    avatar: 'https://ui-avatars.com/api/?name=Alice+Cooper'
                },
                {
                    id: 2,
                    name: 'Bob Wilson',
                    email: 'bob@example.com',
                    access: 'view',
                    avatar: 'https://ui-avatars.com/api/?name=Bob+Wilson'
                }
            ]
        };

        updateShareModal(shareData);

    } catch (error) {
        content.innerHTML = `
            <div class="text-center p-8 text-red-500">
                <i class="fas fa-exclamation-circle text-xl mb-2"></i>
                <p>Failed to load sharing information</p>
            </div>
        `;
    }
}

// Update share modal content
function updateShareModal(data) {
    const modal = document.getElementById('share-modal');
    const content = modal.querySelector('.modal-content');

    content.innerHTML = `
        <div class="p-6 space-y-6">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                <div class="flex items-center space-x-2">
                    <input type="text" 
                           value="${data.link}" 
                           class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           data-share-link
                           readonly>
                    <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            data-copy-link>
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-access-level>
                    <option value="view" ${data.accessLevel === 'view' ? 'selected' : ''}>View only</option>
                    <option value="comment" ${data.accessLevel === 'comment' ? 'selected' : ''}>Can comment</option>
                    <option value="edit" ${data.accessLevel === 'edit' ? 'selected' : ''}>Can edit</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">People with access</label>
                <div class="space-y-3">
                    ${data.collaborators.map(user => `
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <img src="${user.avatar}" alt="${user.name}" class="w-8 h-8 rounded-full">
                                <div class="ml-3">
                                    <p class="text-sm font-medium text-gray-900">${user.name}</p>
                                    <p class="text-xs text-gray-500">${user.email}</p>
                                </div>
                            </div>
                            <select class="text-sm border border-gray-300 rounded-lg px-2 py-1"
                                    data-user-access="${user.id}">
                                <option value="view" ${user.access === 'view' ? 'selected' : ''}>View</option>
                                <option value="comment" ${user.access === 'comment' ? 'selected' : ''}>Comment</option>
                                <option value="edit" ${user.access === 'edit' ? 'selected' : ''}>Edit</option>
                                <option value="remove">Remove</option>
                            </select>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Invite people</label>
                <div class="flex items-center space-x-2">
                    <input type="text" 
                           placeholder="Email address" 
                           class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Invite
                    </button>
                </div>
            </div>
        </div>
    `;

    // Setup user access change handlers
    content.querySelectorAll('[data-user-access]').forEach(select => {
        select.addEventListener('change', async () => {
            const userId = select.dataset.userAccess;
            const access = select.value;
            
            if (access === 'remove') {
                await removeCollaborator(modal.dataset.itemId, userId);
                select.closest('.flex').remove();
            } else {
                await updateUserAccess(modal.dataset.itemId, userId, access);
            }
        });
    });
}

// Update access level
async function updateAccessLevel(itemId, accessLevel) {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.cloudStore.createNotification('Access level updated successfully', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to update access level', 'error');
    }
}

// Update user access
async function updateUserAccess(itemId, userId, access) {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.cloudStore.createNotification('User access updated successfully', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to update user access', 'error');
    }
}

// Remove collaborator
async function removeCollaborator(itemId, userId) {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.cloudStore.createNotification('Collaborator removed successfully', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to remove collaborator', 'error');
    }
}

// Load shared items
async function loadSharedItems() {
    const container = document.getElementById('shared-items');
    if (!container) return;

    try {
        // Show loading state
        container.innerHTML = `
            <div class="col-span-full flex items-center justify-center p-8">
                <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
        `;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock shared items
        const items = [
            {
                id: '1',
                type: 'folder',
                name: 'Project Documents',
                owner: 'Alice Cooper',
                shared: '2024-01-15T10:30:00Z',
                access: 'edit'
            },
            {
                id: '2',
                type: 'file',
                name: 'Q4 Report.pdf',
                owner: 'Bob Wilson',
                shared: '2024-01-14T15:45:00Z',
                access: 'view'
            }
        ];

        updateSharedItems(items);

    } catch (error) {
        container.innerHTML = `
            <div class="col-span-full text-center p-8">
                <i class="fas fa-exclamation-circle text-red-500 text-xl mb-2"></i>
                <p class="text-gray-500">Failed to load shared items</p>
            </div>
        `;
    }
}

// Update shared items
function updateSharedItems(items) {
    const container = document.getElementById('shared-items');
    
    container.innerHTML = items.map(item => `
        <div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
             data-item
             data-id="${item.id}"
             data-name="${item.name}"
             data-owner="${item.owner}"
             data-date="${item.shared}">
            <div class="flex items-center space-x-4">
                <input type="checkbox" 
                       class="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                       data-item-checkbox>
                <i class="fas ${item.type === 'folder' ? 'fa-folder text-blue-500' : 'fa-file text-gray-500'} text-xl"></i>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">${item.name}</p>
                    <p class="text-xs text-gray-500">
                        Shared by ${item.owner} · ${window.cloudStore.formatDate(item.shared)}
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 text-xs rounded-full ${item.access === 'edit' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
                        ${item.access === 'edit' ? 'Can edit' : 'Can view'}
                    </span>
                    <button class="text-gray-400 hover:text-gray-600"
                            data-share-button>
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Setup collaboration features
function setupCollaboration() {
    setupComments();
    setupActivityFeed();
}

// Setup comments
function setupComments() {
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-comment-button]')) {
            const itemId = e.target.closest('[data-item]').dataset.id;
            openCommentsPanel(itemId);
        }
    });
}

// Open comments panel
async function openCommentsPanel(itemId) {
    const panel = document.createElement('div');
    panel.className = 'fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform translate-x-full transition-transform duration-300 z-50';
    panel.innerHTML = `
        <div class="h-full flex flex-col">
            <div class="p-4 border-b flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900">Comments</h3>
                <button class="text-gray-400 hover:text-gray-600" data-close-panel>
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
                <div class="flex items-start space-x-3">
                    <img src="https://ui-avatars.com/api/?name=Alice+Cooper" 
                         class="w-8 h-8 rounded-full">
                    <div class="flex-1">
                        <div class="bg-gray-100 rounded-lg p-3">
                            <p class="text-sm font-medium text-gray-900">Alice Cooper</p>
                            <p class="text-sm text-gray-700">Please review the latest changes.</p>
                        </div>
                        <div class="flex items-center space-x-4 mt-1">
                            <button class="text-xs text-gray-500 hover:text-gray-700">Reply</button>
                            <span class="text-xs text-gray-500">2 hours ago</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t">
                <div class="flex items-start space-x-3">
                    <img src="https://ui-avatars.com/api/?name=Current+User" 
                         class="w-8 h-8 rounded-full">
                    <div class="flex-1">
                        <textarea class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3"
                                  placeholder="Add a comment..."></textarea>
                        <div class="flex justify-end mt-2">
                            <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                Comment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(panel);
    requestAnimationFrame(() => {
        panel.classList.remove('translate-x-full');
    });

    // Close panel
    panel.querySelector('[data-close-panel]').addEventListener('click', () => {
        panel.classList.add('translate-x-full');
        setTimeout(() => panel.remove(), 300);
    });
}

// Setup activity feed
function setupActivityFeed() {
    const container = document.getElementById('activity-feed');
    if (!container) return;

    // Mock activities
    const activities = [
        {
            type: 'comment',
            user: 'Alice Cooper',
            action: 'commented on',
            target: 'Q4 Report.pdf',
            time: '2 hours ago'
        },
        {
            type: 'edit',
            user: 'Bob Wilson',
            action: 'edited',
            target: 'Project Timeline.xlsx',
            time: '4 hours ago'
        }
    ];

    container.innerHTML = activities.map(activity => `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
                <img src="https://ui-avatars.com/api/?name=${activity.user.replace(' ', '+')}" 
                     class="w-8 h-8 rounded-full">
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900">
                    <span class="font-medium">${activity.user}</span>
                    ${activity.action}
                    <span class="font-medium">${activity.target}</span>
                </p>
                <p class="text-xs text-gray-500">${activity.time}</p>
            </div>
        </div>
    `).join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    setupSharedContent();
    setupSearchAndFilter();
    setupBatchOperations();
});

// Initialize shared content
function setupSharedContent() {
    loadSharedWithMe();
    loadSharedByMe();
    setupShareModal();
    setupFilters();
}

// Load shared by me content
async function loadSharedByMe() {
    const container = document.getElementById('shared-by-me');
    if (!container) return;

    const sharedFiles = [
        {
            id: 1,
            name: 'Project Proposal.pdf',
            type: 'pdf',
            sharedWith: [
                { name: 'Alice Cooper', email: 'alice@example.com', access: 'edit' },
                { name: 'Bob Wilson', email: 'bob@example.com', access: 'view' }
            ],
            lastAccessed: '2 hours ago',
            size: '2.5 MB'
        },
        {
            id: 2,
            name: 'Meeting Notes.docx',
            type: 'doc',
            sharedWith: [
                { name: 'Team Alpha', email: 'team-alpha@example.com', access: 'edit' }
            ],
            lastAccessed: '1 day ago',
            size: '1.2 MB'
        },
        {
            id: 3,
            name: 'Marketing Assets',
            type: 'folder',
            sharedWith: [
                { name: 'Marketing Team', email: 'marketing@example.com', access: 'edit' },
                { name: 'Design Team', email: 'design@example.com', access: 'view' }
            ],
            lastAccessed: '3 days ago',
            size: '156 MB'
        }
    ];

    renderSharedItems(container, sharedFiles);
    setupShareActions();
}

// Render shared items
function renderSharedItems(container, items) {
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Shared With
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Accessed
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                        </th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${items.map(item => `
                        <tr class="hover:bg-gray-50 transition-colors" data-item-id="${item.id}">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <i class="fas fa-${getFileIcon(item.type)} text-${getFileColor(item.type)} mr-3"></i>
                                    <span class="text-sm text-gray-900">${item.name}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex -space-x-2 mr-2">
                                        ${item.sharedWith.slice(0, 3).map(user => `
                                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}" 
                                                 alt="${user.name}" 
                                                 class="w-6 h-6 rounded-full border-2 border-white"
                                                 title="${user.name} (${user.access})">
                                        `).join('')}
                                    </div>
                                    ${item.sharedWith.length > 3 ? 
                                        `<span class="text-sm text-gray-500">+${item.sharedWith.length - 3} more</span>` : 
                                        ''}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${item.lastAccessed}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${item.size}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button class="text-blue-600 hover:text-blue-900 mr-3" onclick="manageSharing(${item.id})">
                                    <i class="fas fa-user-plus"></i>
                                </button>
                                <button class="text-gray-600 hover:text-gray-900" onclick="showFileMenu(this, ${item.id})">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Setup share actions
function setupShareActions() {
    setupCopyLink();
    setupShareMenu();
    setupAccessControls();
}

// Manage sharing for a specific item
function manageSharing(itemId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4 animate-scale">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Manage Sharing</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                    <div class="flex items-center space-x-2">
                        <input type="text" 
                               value="https://cloudstore.com/share/${itemId}" 
                               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                               readonly>
                        <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200" onclick="copyShareLink(this)">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">People with access</label>
                    <div class="space-y-3" id="access-list">
                        <!-- Access list will be populated dynamically -->
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Add people</label>
                    <div class="flex items-center space-x-2">
                        <input type="text" 
                               placeholder="Email address" 
                               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <select class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="view">Can view</option>
                            <option value="comment">Can comment</option>
                            <option value="edit">Can edit</option>
                        </select>
                        <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onclick="addPerson(this)">
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    loadAccessList(itemId);
}

// Load access list
async function loadAccessList(itemId) {
    const container = document.getElementById('access-list');
    if (!container) return;

    // Simulate API call
    const accessList = [
        { id: 1, name: 'Alice Cooper', email: 'alice@example.com', access: 'edit', avatar: 'AC' },
        { id: 2, name: 'Bob Wilson', email: 'bob@example.com', access: 'view', avatar: 'BW' }
    ];

    container.innerHTML = accessList.map(user => `
        <div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
            <div class="flex items-center">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.avatar)}" 
                     alt="${user.name}" 
                     class="w-8 h-8 rounded-full mr-3">
                <div>
                    <p class="text-sm font-medium text-gray-900">${user.name}</p>
                    <p class="text-xs text-gray-500">${user.email}</p>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <select class="text-sm border border-gray-300 rounded-lg px-2 py-1" 
                        onchange="updateAccess(${itemId}, ${user.id}, this.value)">
                    <option value="view" ${user.access === 'view' ? 'selected' : ''}>Can view</option>
                    <option value="comment" ${user.access === 'comment' ? 'selected' : ''}>Can comment</option>
                    <option value="edit" ${user.access === 'edit' ? 'selected' : ''}>Can edit</option>
                </select>
                <button class="text-gray-400 hover:text-red-500" onclick="removeAccess(${itemId}, ${user.id}, this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Update access level
async function updateAccess(itemId, userId, access) {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        window.cloudStore.createNotification('Access level updated', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to update access level', 'error');
    }
}

// Remove access
async function removeAccess(itemId, userId, button) {
    try {
        const confirmed = await confirmDialog('Are you sure you want to remove this person\'s access?');
        if (!confirmed) return;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        button.closest('.flex.items-center.justify-between').remove();
        window.cloudStore.createNotification('Access removed', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to remove access', 'error');
    }
}

// Add new person
async function addPerson(button) {
    const container = button.closest('div');
    const email = container.querySelector('input').value;
    const access = container.querySelector('select').value;

    if (!email) {
        window.cloudStore.createNotification('Please enter an email address', 'error');
        return;
    }

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const accessList = document.getElementById('access-list');
        const newUser = {
            id: Date.now(),
            name: email.split('@')[0],
            email,
            access,
            avatar: email.substring(0, 2).toUpperCase()
        };

        const userElement = document.createElement('div');
        userElement.className = 'flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg';
        userElement.innerHTML = `
            <div class="flex items-center">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.avatar)}" 
                     alt="${newUser.name}" 
                     class="w-8 h-8 rounded-full mr-3">
                <div>
                    <p class="text-sm font-medium text-gray-900">${newUser.name}</p>
                    <p class="text-xs text-gray-500">${newUser.email}</p>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <select class="text-sm border border-gray-300 rounded-lg px-2 py-1" 
                        onchange="updateAccess(${itemId}, ${newUser.id}, this.value)">
                    <option value="view" ${newUser.access === 'view' ? 'selected' : ''}>Can view</option>
                    <option value="comment" ${newUser.access === 'comment' ? 'selected' : ''}>Can comment</option>
                    <option value="edit" ${newUser.access === 'edit' ? 'selected' : ''}>Can edit</option>
                </select>
                <button class="text-gray-400 hover:text-red-500" onclick="removeAccess(${itemId}, ${newUser.id}, this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        accessList.insertBefore(userElement, accessList.firstChild);
        container.querySelector('input').value = '';
        
        window.cloudStore.createNotification('Invitation sent', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to add person', 'error');
    }
}

// Helper functions
function getFileIcon(type) {
    const icons = {
        pdf: 'file-pdf',
        doc: 'file-word',
        folder: 'folder',
        image: 'file-image',
        video: 'file-video',
        audio: 'file-audio'
    };
    return icons[type] || 'file';
}

function getFileColor(type) {
    const colors = {
        pdf: 'red-500',
        doc: 'blue-500',
        folder: 'yellow-500',
        image: 'green-500',
        video: 'purple-500',
        audio: 'pink-500'
    };
    return colors[type] || 'gray-500';
}

// Copy share link
function copyShareLink(button) {
    const input = button.previousElementSibling;
    input.select();
    document.execCommand('copy');
    window.cloudStore.createNotification('Link copied to clipboard', 'success');
}

// Setup shared items list
function setupSharedItemsList() {
    const mockSharedItems = [
        {
            id: 1,
            name: 'Project Proposal.docx',
            type: 'document',
            size: '2.5MB',
            sharedWith: [
                { email: 'sarah@example.com', access: 'edit' },
                { email: 'mike@example.com', access: 'view' }
            ],
            lastAccessed: '2 hours ago',
            link: 'https://cloudstore.com/s/abc123'
        },
        {
            id: 2,
            name: 'Marketing Assets',
            type: 'folder',
            size: '156MB',
            sharedWith: [
                { email: 'marketing@example.com', access: 'edit' },
                { email: 'design@example.com', access: 'view' }
            ],
            lastAccessed: '1 day ago',
            link: 'https://cloudstore.com/s/xyz789'
        },
        {
            id: 3,
            name: 'Financial Report Q3.xlsx',
            type: 'spreadsheet',
            size: '1.8MB',
            sharedWith: [
                { email: 'finance@example.com', access: 'edit' }
            ],
            lastAccessed: '3 days ago',
            link: 'https://cloudstore.com/s/def456'
        }
    ];

    const container = document.querySelector('#shared-by-me-list');
    if (!container) return;

    container.innerHTML = mockSharedItems.map(item => `
        <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 mb-4" data-item-id="${item.id}">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="text-2xl ${getItemTypeColor(item.type)}">
                        <i class="fas ${getItemTypeIcon(item.type)}"></i>
                    </div>
                    <div>
                        <h3 class="font-medium text-gray-900">${item.name}</h3>
                        <p class="text-sm text-gray-500">
                            ${item.size} • Shared with ${item.sharedWith.length} people • Last accessed ${item.lastAccessed}
                        </p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="p-2 hover:bg-gray-100 rounded-full" onclick="copyShareLink('${item.link}')">
                        <i class="fas fa-link text-gray-500"></i>
                    </button>
                    <button class="p-2 hover:bg-gray-100 rounded-full" onclick="manageSharing(${item.id})">
                        <i class="fas fa-users text-gray-500"></i>
                    </button>
                    <div class="relative">
                        <button class="p-2 hover:bg-gray-100 rounded-full" onclick="toggleItemMenu(${item.id})">
                            <i class="fas fa-ellipsis-v text-gray-500"></i>
                        </button>
                        <div id="item-menu-${item.id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <div class="py-1">
                                <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onclick="stopSharing(${item.id})">
                                    Stop sharing
                                </button>
                                <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onclick="changeAccessLevel(${item.id})">
                                    Change access
                                </button>
                                <button class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" onclick="revokeAllAccess(${item.id})">
                                    Revoke all access
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            document.querySelectorAll('[id^="item-menu-"]').forEach(menu => {
                menu.classList.add('hidden');
            });
        }
    });
}

function getItemTypeColor(type) {
    const colors = {
        document: 'text-blue-500',
        folder: 'text-yellow-500',
        spreadsheet: 'text-green-500',
        image: 'text-purple-500',
        video: 'text-red-500'
    };
    return colors[type] || 'text-gray-500';
}

function getItemTypeIcon(type) {
    const icons = {
        document: 'fa-file-word',
        folder: 'fa-folder',
        spreadsheet: 'fa-file-excel',
        image: 'fa-file-image',
        video: 'fa-file-video'
    };
    return icons[type] || 'fa-file';
}

async function copyShareLink(link) {
    try {
        await navigator.clipboard.writeText(link);
        window.cloudStore.createNotification('Share link copied to clipboard', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to copy link', 'error');
    }
}

function toggleItemMenu(itemId) {
    const menu = document.getElementById(`item-menu-${itemId}`);
    if (!menu) return;

    // Close other menus
    document.querySelectorAll('[id^="item-menu-"]').forEach(m => {
        if (m.id !== `item-menu-${itemId}`) {
            m.classList.add('hidden');
        }
    });

    menu.classList.toggle('hidden');
}

async function stopSharing(itemId) {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const item = document.querySelector(`[data-item-id="${itemId}"]`);
        if (item) {
            item.classList.add('animate-fade-out');
            setTimeout(() => item.remove(), 300);
        }
        window.cloudStore.createNotification('Sharing stopped successfully', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to stop sharing', 'error');
    }
}

async function changeAccessLevel(itemId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Change Access Level</h3>
            <div class="space-y-4" id="access-list-${itemId}">
                Loading...
            </div>
            <div class="flex justify-end mt-6">
                <button class="px-4 py-2 text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    loadAccessList(itemId);
}

async function loadAccessList(itemId) {
    const container = document.getElementById(`access-list-${itemId}`);
    if (!container) return;

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUsers = [
            { id: 1, email: 'sarah@example.com', access: 'edit', avatar: 'https://ui-avatars.com/api/?name=Sarah' },
            { id: 2, email: 'mike@example.com', access: 'view', avatar: 'https://ui-avatars.com/api/?name=Mike' }
        ];

        container.innerHTML = mockUsers.map(user => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <img src="${user.avatar}" alt="${user.email}" class="w-8 h-8 rounded-full">
                    <span class="text-gray-900">${user.email}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <select class="text-sm border border-gray-300 rounded-lg px-2 py-1" 
                            onchange="updateAccess(${itemId}, ${user.id}, this.value)">
                        <option value="view" ${user.access === 'view' ? 'selected' : ''}>Can view</option>
                        <option value="comment" ${user.access === 'comment' ? 'selected' : ''}>Can comment</option>
                        <option value="edit" ${user.access === 'edit' ? 'selected' : ''}>Can edit</option>
                    </select>
                    <button class="text-gray-400 hover:text-red-500" onclick="removeAccess(${itemId}, ${user.id}, this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = 'Failed to load access list';
    }
}

async function updateAccess(itemId, userId, access) {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        window.cloudStore.createNotification('Access level updated', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to update access level', 'error');
    }
}

async function removeAccess(itemId, userId, button) {
    try {
        if (!confirm('Are you sure you want to remove access for this user?')) return;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        button.closest('.flex.items-center.justify-between').remove();
        window.cloudStore.createNotification('Access removed', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to remove access', 'error');
    }
}

async function revokeAllAccess(itemId) {
    try {
        if (!confirm('Are you sure you want to revoke access for all users? This action cannot be undone.')) return;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const item = document.querySelector(`[data-item-id="${itemId}"]`);
        if (item) {
            item.classList.add('animate-fade-out');
            setTimeout(() => item.remove(), 300);
        }
        window.cloudStore.createNotification('All access has been revoked', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to revoke access', 'error');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupSharedItemsList();
});

// Initialize shared files page
document.addEventListener('DOMContentLoaded', () => {
    setupSharedTabs();
    loadSharedWithMe();
    loadSharedByMe();
    setupSharingModal();
    setupFilters();
    setupBulkActions();
});

// Setup shared tabs
function setupSharedTabs() {
    const sharedWithMeTab = document.getElementById('shared-with-me-tab');
    const sharedByMeTab = document.getElementById('shared-by-me-tab');
    const sharedWithMeContent = document.getElementById('shared-with-me-content');
    const sharedByMeContent = document.getElementById('shared-by-me-content');

    sharedWithMeTab?.addEventListener('click', () => {
        sharedWithMeTab.classList.add('border-blue-500', 'text-blue-600');
        sharedByMeTab?.classList.remove('border-blue-500', 'text-blue-600');
        sharedWithMeContent?.classList.remove('hidden');
        sharedByMeContent?.classList.add('hidden');
    });

    sharedByMeTab?.addEventListener('click', () => {
        sharedByMeTab.classList.add('border-blue-500', 'text-blue-600');
        sharedWithMeTab?.classList.remove('border-blue-500', 'text-blue-600');
        sharedByMeContent?.classList.remove('hidden');
        sharedWithMeContent?.classList.add('hidden');
    });
}

// Load shared with me files
function loadSharedWithMe() {
    const container = document.getElementById('shared-with-me-content');
    if (!container) return;

    const sharedFiles = [
        {
            id: 1,
            name: 'Project Proposal.pdf',
            sharedBy: 'Alice Smith',
            date: '2024-01-15T10:30:00Z',
            size: 2.5 * 1024 * 1024,
            type: 'document',
            access: 'view'
        },
        {
            id: 2,
            name: 'Marketing Assets',
            sharedBy: 'Bob Johnson',
            date: '2024-01-14T15:45:00Z',
            size: 150 * 1024 * 1024,
            type: 'folder',
            access: 'edit'
        },
        {
            id: 3,
            name: 'Team Photo.jpg',
            sharedBy: 'Carol Williams',
            date: '2024-01-13T08:15:00Z',
            size: 5 * 1024 * 1024,
            type: 'image',
            access: 'view'
        }
    ];

    renderSharedFiles(container, sharedFiles);
}

// Load shared by me files
function loadSharedByMe() {
    const container = document.getElementById('shared-by-me-content');
    if (!container) return;

    const sharedFiles = [
        {
            id: 4,
            name: 'Q4 Report.xlsx',
            sharedWith: ['david@example.com', 'emma@example.com'],
            date: '2024-01-15T09:00:00Z',
            size: 1.8 * 1024 * 1024,
            type: 'document',
            access: 'edit',
            expires: '2024-02-15T00:00:00Z'
        },
        {
            id: 5,
            name: 'Client Presentations',
            sharedWith: ['team@example.com'],
            date: '2024-01-14T14:30:00Z',
            size: 250 * 1024 * 1024,
            type: 'folder',
            access: 'view',
            expires: null
        },
        {
            id: 6,
            name: 'Product Demo.mp4',
            sharedWith: ['marketing@example.com'],
            date: '2024-01-13T11:20:00Z',
            size: 75 * 1024 * 1024,
            type: 'video',
            access: 'edit',
            expires: '2024-01-20T00:00:00Z'
        }
    ];

    renderSharedByMeFiles(container, sharedFiles);
}

// Render shared files
function renderSharedFiles(container, files) {
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="p-4 border-b">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-medium text-gray-900">Shared with me</h2>
                    <div class="flex items-center space-x-2">
                        <input type="text" placeholder="Search files..." 
                               class="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <button class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-filter"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shared By</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${files.map(file => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <i class="fas fa-${getFileIcon(file.type)} text-${getFileColor(file.type)} mr-3"></i>
                                        <span class="text-sm text-gray-900">${file.name}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <img src="https://ui-avatars.com/api/?name=${file.sharedBy}" alt="" class="h-6 w-6 rounded-full mr-2">
                                        <span class="text-sm text-gray-900">${file.sharedBy}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${formatDate(file.date)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 text-xs font-medium ${getAccessBadgeColor(file.access)} rounded-full">
                                        ${file.access.charAt(0).toUpperCase() + file.access.slice(1)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${formatSize(file.size)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onclick="downloadFile(${file.id})" class="text-gray-600 hover:text-gray-900 mr-3">
                                        <i class="fas fa-download"></i>
                                    </button>
                                    ${file.access === 'edit' ? `
                                        <button onclick="editFile(${file.id})" class="text-gray-600 hover:text-gray-900">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Render shared by me files
function renderSharedByMeFiles(container, files) {
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="p-4 border-b">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-medium text-gray-900">Shared by me</h2>
                    <div class="flex items-center space-x-2">
                        <button onclick="shareNewFile()" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                            <i class="fas fa-share mr-2"></i>
                            Share New
                        </button>
                    </div>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shared With</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${files.map(file => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <i class="fas fa-${getFileIcon(file.type)} text-${getFileColor(file.type)} mr-3"></i>
                                        <span class="text-sm text-gray-900">${file.name}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center flex-wrap gap-2">
                                        ${file.sharedWith.map(email => `
                                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                ${email}
                                                <button onclick="removeSharedUser('${email}', ${file.id})" class="ml-1 text-gray-500 hover:text-gray-700">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </span>
                                        `).join('')}
                                        <button onclick="showSharingModal(${file.id})" class="text-blue-500 hover:text-blue-700">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${formatDate(file.date)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <select onchange="updateAccess(${file.id}, this.value)" 
                                            class="text-sm border-gray-300 rounded-lg focus:ring-blue-500">
                                        <option value="view" ${file.access === 'view' ? 'selected' : ''}>View</option>
                                        <option value="edit" ${file.access === 'edit' ? 'selected' : ''}>Edit</option>
                                    </select>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    ${file.expires ? `
                                        <span class="text-gray-500">${formatDate(file.expires)}</span>
                                        <button onclick="updateExpiry(${file.id})" class="ml-2 text-gray-400 hover:text-gray-600">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    ` : `
                                        <button onclick="updateExpiry(${file.id})" class="text-blue-500 hover:text-blue-700">
                                            Set expiration
                                        </button>
                                    `}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onclick="copyShareLink(${file.id})" class="text-gray-600 hover:text-gray-900 mr-3" title="Copy share link">
                                        <i class="fas fa-link"></i>
                                    </button>
                                    <button onclick="stopSharing(${file.id})" class="text-red-500 hover:text-red-700" title="Stop sharing">
                                        <i class="fas fa-ban"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Helper functions for file display
function getFileIcon(type) {
    const icons = {
        document: 'file-alt',
        folder: 'folder',
        image: 'image',
        video: 'video'
    };
    return icons[type] || 'file';
}

function getFileColor(type) {
    const colors = {
        document: 'blue-500',
        folder: 'yellow-500',
        image: 'green-500',
        video: 'purple-500'
    };
    return colors[type] || 'gray-500';
}

function getAccessBadgeColor(access) {
    return access === 'edit' ? 
        'bg-green-100 text-green-800' : 
        'bg-gray-100 text-gray-800';
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

// File actions
async function downloadFile(fileId) {
    try {
        window.cloudStore.createNotification('Starting download...', 'info');
        // Simulate download progress
        await new Promise(resolve => setTimeout(resolve, 2000));
        window.cloudStore.createNotification('File downloaded successfully', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Download failed', 'error');
    }
}

function editFile(fileId) {
    window.location.href = `/editor.html?file=${fileId}`;
}

async function shareNewFile() {
    // Show file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async () => {
        if (input.files.length) {
            for (const file of input.files) {
                await uploadAndShare(file);
            }
        }
    };
    input.click();
}

async function uploadAndShare(file) {
    try {
        window.cloudStore.createNotification(`Uploading ${file.name}...`, 'info');
        // Simulate upload
        await new Promise(resolve => setTimeout(resolve, 2000));
        showSharingModal();
    } catch (error) {
        window.cloudStore.createNotification('Upload failed', 'error');
    }
}

async function showSharingModal(fileId = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Share File</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        People to share with
                    </label>
                    <input type="text" 
                           class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Enter email addresses">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Access level
                    </label>
                    <select class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="view">Can view</option>
                        <option value="edit">Can edit</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Expiration (optional)
                    </label>
                    <input type="date" 
                           class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Message (optional)
                    </label>
                    <textarea class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                              placeholder="Add a message..."></textarea>
                </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button onclick="this.closest('.fixed').remove()" 
                        class="px-4 py-2 text-gray-500 hover:text-gray-700">
                    Cancel
                </button>
                <button onclick="handleShare(${fileId})" 
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Share
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function handleShare(fileId) {
    try {
        window.cloudStore.createNotification('Sharing file...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.cloudStore.createNotification('File shared successfully', 'success');
        document.querySelector('.fixed')?.remove();
        loadSharedByMe(); // Refresh the list
    } catch (error) {
        window.cloudStore.createNotification('Failed to share file', 'error');
    }
}

async function removeSharedUser(email, fileId) {
    try {
        if (!confirm(`Remove access for ${email}?`)) return;
        
        window.cloudStore.createNotification('Removing access...', 'info');
        await new Promise(resolve => setTimeout(resolve, 500));
        window.cloudStore.createNotification(`Access removed for ${email}`, 'success');
        loadSharedByMe(); // Refresh the list
    } catch (error) {
        window.cloudStore.createNotification('Failed to remove access', 'error');
    }
}

async function updateAccess(fileId, access) {
    try {
        window.cloudStore.createNotification('Updating access level...', 'info');
        await new Promise(resolve => setTimeout(resolve, 500));
        window.cloudStore.createNotification('Access level updated', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to update access level', 'error');
    }
}

async function updateExpiry(fileId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Update Expiration</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Expiration date
                    </label>
                    <input type="date" 
                           class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button onclick="this.closest('.fixed').remove()" 
                        class="px-4 py-2 text-gray-500 hover:text-gray-700">
                    Cancel
                </button>
                <button onclick="saveExpiry(${fileId})" 
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Save
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveExpiry(fileId) {
    try {
        const date = document.querySelector('input[type="date"]').value;
        if (!date) {
            window.cloudStore.createNotification('Please select a date', 'error');
            return;
        }

        window.cloudStore.createNotification('Updating expiration...', 'info');
        await new Promise(resolve => setTimeout(resolve, 500));
        window.cloudStore.createNotification('Expiration date updated', 'success');
        document.querySelector('.fixed')?.remove();
        loadSharedByMe(); // Refresh the list
    } catch (error) {
        window.cloudStore.createNotification('Failed to update expiration', 'error');
    }
}

async function copyShareLink(fileId) {
    try {
        const link = `https://cloudstore.example.com/share/${fileId}`;
        await navigator.clipboard.writeText(link);
        window.cloudStore.createNotification('Share link copied to clipboard', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to copy link', 'error');
    }
}

async function stopSharing(fileId) {
    try {
        if (!confirm('Are you sure you want to stop sharing this file?')) return;
        
        window.cloudStore.createNotification('Removing all access...', 'info');
        await new Promise(resolve => setTimeout(resolve, 500));
        window.cloudStore.createNotification('Sharing stopped', 'success');
        loadSharedByMe(); // Refresh the list
    } catch (error) {
        window.cloudStore.createNotification('Failed to stop sharing', 'error');
    }
}

// Setup filters
function setupFilters() {
    const filterButton = document.querySelector('[data-action="filter"]');
    if (!filterButton) return;

    filterButton.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Filter Files</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            File Type
                        </label>
                        <select class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">All Types</option>
                            <option value="document">Documents</option>
                            <option value="image">Images</option>
                            <option value="video">Videos</option>
                            <option value="folder">Folders</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Date Range
                        </label>
                        <div class="grid grid-cols-2 gap-4">
                            <input type="date" 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   placeholder="From">
                            <input type="date" 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   placeholder="To">
                        </div>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-3">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="px-4 py-2 text-gray-500 hover:text-gray-700">
                        Cancel
                    </button>
                    <button onclick="applyFilters()" 
                            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Apply Filters
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    });
}

// Setup bulk actions
function setupBulkActions() {
    const bulkActionButton = document.querySelector('[data-action="bulk"]');
    if (!bulkActionButton) return;

    bulkActionButton.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Bulk Actions</h3>
                <div class="space-y-4">
                    <button class="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg"
                            onclick="bulkDownload()">
                        <i class="fas fa-download mr-2"></i>
                        Download All
                    </button>
                    <button class="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg"
                            onclick="bulkStopSharing()">
                        <i class="fas fa-ban mr-2 text-red-500"></i>
                        Stop Sharing All
                    </button>
                </div>
                <div class="mt-6 flex justify-end">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="px-4 py-2 text-gray-500 hover:text-gray-700">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    });
}

// Bulk actions
async function bulkDownload() {
    try {
        window.cloudStore.createNotification('Preparing files for download...', 'info');
        await new Promise(resolve => setTimeout(resolve, 2000));
        window.cloudStore.createNotification('Files downloaded successfully', 'success');
        document.querySelector('.fixed')?.remove();
    } catch (error) {
        window.cloudStore.createNotification('Failed to download files', 'error');
    }
}

async function bulkStopSharing() {
    try {
        if (!confirm('Are you sure you want to stop sharing all selected files?')) return;
        
        window.cloudStore.createNotification('Removing all access...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.cloudStore.createNotification('Sharing stopped for all selected files', 'success');
        document.querySelector('.fixed')?.remove();
        loadSharedByMe(); // Refresh the list
    } catch (error) {
        window.cloudStore.createNotification('Failed to stop sharing', 'error');
    }
}