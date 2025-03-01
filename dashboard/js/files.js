import { fileOperations } from './fileOperations.js';

// Initialize Uppy
const uppy = new Uppy.Core({
    restrictions: {
        maxFileSize: 2000000000, // 2GB
        allowedFileTypes: null // Allow all file types
    }
});

// Add Dashboard plugin
uppy.use(Uppy.Dashboard, {
    inline: false,
    target: '#drop-zone',
    showProgressDetails: true,
    proudlyDisplayPoweredByUppy: false,
    height: 470,
});

// Handle file uploads using our fileOperations module
uppy.on('upload', async (data) => {
    const files = data.fileIDs.map(fileId => uppy.getFile(fileId));
    
    for (const file of files) {
        try {
            const result = await fileOperations.uploadFile(file.data, (progress) => {
                uppy.setFileState(file.id, {
                    progress: { percentage: progress, uploadComplete: false }
                });
            });

            // Update UI with the new file
            addFileToGrid(result);
            window.cloudStore.createNotification(`${file.name} uploaded successfully`);
        } catch (error) {
            console.error('Upload error:', error);
            uppy.setFileState(file.id, { error: error.message });
        }
    }
});

// Add file to grid view
function addFileToGrid(file) {
    const grid = document.querySelector('.grid');
    const fileDiv = document.createElement('div');
    fileDiv.className = 'p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer';
    
    const fileIcon = getFileIcon(file.type);
    fileDiv.innerHTML = `
        <div class="flex items-start justify-between">
            <div class="flex items-center">
                <i class="fas ${fileIcon} text-3xl mr-3"></i>
                <div>
                    <h4 class="font-medium text-gray-900">${file.name}</h4>
                    <p class="text-sm text-gray-500">${window.cloudStore.formatFileSize(file.size)}</p>
                </div>
            </div>
            <button class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-ellipsis-v"></i>
            </button>
        </div>
    `;

    grid.insertBefore(fileDiv, grid.firstChild);
    setupFileContextMenu(fileDiv, file);
}

// Get appropriate icon based on file type
function getFileIcon(type) {
    const icons = {
        'application/pdf': 'fa-file-pdf text-red-500',
        'image/': 'fa-file-image text-green-500',
        'video/': 'fa-file-video text-blue-500',
        'audio/': 'fa-file-audio text-purple-500',
        'text/': 'fa-file-alt text-gray-500',
        'application/msword': 'fa-file-word text-blue-500',
        'application/vnd.ms-excel': 'fa-file-excel text-green-500',
        'application/vnd.ms-powerpoint': 'fa-file-powerpoint text-orange-500',
        'application/zip': 'fa-file-archive text-yellow-500'
    };

    for (const [mimeType, icon] of Object.entries(icons)) {
        if (type.startsWith(mimeType)) {
            return icon;
        }
    }

    return 'fa-file text-gray-500';
}

// Setup context menu for files
function setupFileContextMenu(fileDiv, file) {
    fileDiv.addEventListener('contextmenu', async (e) => {
        e.preventDefault();
        const contextMenu = document.getElementById('context-menu');
        
        // Position context menu
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        contextMenu.classList.remove('hidden');

        // Setup context menu actions
        const downloadButton = contextMenu.querySelector('button:contains("Download")');
        const shareButton = contextMenu.querySelector('button:contains("Share")');
        const deleteButton = contextMenu.querySelector('button:contains("Delete")');

        downloadButton.onclick = async () => {
            contextMenu.classList.add('hidden');
            try {
                await fileOperations.downloadFile(file.id, (progress) => {
                    // Show download progress
                    window.cloudStore.createNotification(`Downloading: ${progress}%`);
                });
                window.cloudStore.createNotification('Download complete');
            } catch (error) {
                window.cloudStore.createNotification('Download failed');
            }
        };

        shareButton.onclick = async () => {
            contextMenu.classList.add('hidden');
            try {
                const shareLink = await fileOperations.generateShareLink(file.id);
                navigator.clipboard.writeText(shareLink.link);
                window.cloudStore.createNotification('Share link copied to clipboard');
            } catch (error) {
                window.cloudStore.createNotification('Failed to generate share link');
            }
        };

        deleteButton.onclick = async () => {
            contextMenu.classList.add('hidden');
            if (confirm('Are you sure you want to delete this file?')) {
                try {
                    await fileOperations.deleteFile(file.id);
                    fileDiv.remove();
                    window.cloudStore.createNotification('File moved to trash');
                } catch (error) {
                    window.cloudStore.createNotification('Failed to delete file');
                }
            }
        };
    });
}

// Hide context menu when clicking outside
document.addEventListener('click', () => {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.classList.add('hidden');
});

// File list/grid view toggle
const listViewButton = document.querySelector('.fa-list-ul').parentElement;
const gridViewButton = document.querySelector('.fa-th-large').parentElement;
const filesContainer = document.querySelector('.grid');

listViewButton.addEventListener('click', () => {
    filesContainer.classList.remove('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
    filesContainer.classList.add('grid-cols-1');
    listViewButton.classList.add('text-blue-500');
    gridViewButton.classList.remove('text-blue-500');
});

gridViewButton.addEventListener('click', () => {
    filesContainer.classList.remove('grid-cols-1');
    filesContainer.classList.add('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
    gridViewButton.classList.add('text-blue-500');
    listViewButton.classList.remove('text-blue-500');
});

// Search functionality
const searchInput = document.querySelector('input[placeholder="Search files..."]');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const files = document.querySelectorAll('.grid > div');
    
    files.forEach(file => {
        const fileName = file.querySelector('h4').textContent.toLowerCase();
        if (fileName.includes(searchTerm)) {
            file.style.display = '';
        } else {
            file.style.display = 'none';
        }
    });
});

// File operations initialization
document.addEventListener('DOMContentLoaded', () => {
    const fileOperations = {
        downloadFile: async (fileId, progressCallback) => {
            // Simulate download progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                progressCallback(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                }
            }, 500);
            return new Promise(resolve => setTimeout(resolve, 5000));
        },
        deleteFile: async (fileId) => {
            return new Promise(resolve => setTimeout(resolve, 1000));
        },
        generateShareLink: async (fileId) => {
            return { link: `https://cloudstore.com/share/${fileId}` };
        }
    };

    // Context menu functionality
    const contextMenu = document.getElementById('context-menu');
    let currentFile = null;

    document.addEventListener('click', () => {
        contextMenu.classList.add('hidden');
    });

    // Action buttons functionality
    const initializeFileActions = () => {
        const fileRows = document.querySelectorAll('tbody tr');
        
        fileRows.forEach(row => {
            const fileName = row.querySelector('.text-gray-900').textContent;
            const fileId = row.dataset.fileId || 'dummy-id';
            
            // Context menu for ellipsis button
            const menuButton = row.querySelector('.fa-ellipsis-v')?.parentElement;
            menuButton?.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentFile = { id: fileId, name: fileName };
                
                // Position context menu
                contextMenu.style.left = `${e.clientX}px`;
                contextMenu.style.top = `${e.clientY}px`;
                contextMenu.classList.remove('hidden');
            });

            // Download button
            const downloadButton = row.querySelector('.fa-download')?.parentElement;
            downloadButton?.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await fileOperations.downloadFile(fileId, (progress) => {
                        window.cloudStore.createNotification(`Downloading ${fileName}: ${progress}%`);
                    });
                    window.cloudStore.createNotification(`${fileName} downloaded successfully`);
                } catch (error) {
                    window.cloudStore.createNotification('Download failed');
                }
            });

            // Share button
            const shareButton = row.querySelector('.fa-share')?.parentElement;
            shareButton?.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const { link } = await fileOperations.generateShareLink(fileId);
                    await navigator.clipboard.writeText(link);
                    window.cloudStore.createNotification('Share link copied to clipboard');
                } catch (error) {
                    window.cloudStore.createNotification('Failed to generate share link');
                }
            });
        });
    };

    // Context menu actions
    const downloadContextButton = contextMenu.querySelector('button:contains("Download")');
    const shareContextButton = contextMenu.querySelector('button:contains("Share")');
    const renameContextButton = contextMenu.querySelector('button:contains("Rename")');
    const deleteContextButton = contextMenu.querySelector('button:contains("Delete")');

    downloadContextButton?.addEventListener('click', async () => {
        if (!currentFile) return;
        contextMenu.classList.add('hidden');
        try {
            await fileOperations.downloadFile(currentFile.id, (progress) => {
                window.cloudStore.createNotification(`Downloading ${currentFile.name}: ${progress}%`);
            });
            window.cloudStore.createNotification(`${currentFile.name} downloaded successfully`);
        } catch (error) {
            window.cloudStore.createNotification('Download failed');
        }
    });

    shareContextButton?.addEventListener('click', async () => {
        if (!currentFile) return;
        contextMenu.classList.add('hidden');
        try {
            const { link } = await fileOperations.generateShareLink(currentFile.id);
            await navigator.clipboard.writeText(link);
            window.cloudStore.createNotification('Share link copied to clipboard');
        } catch (error) {
            window.cloudStore.createNotification('Failed to generate share link');
        }
    });

    deleteContextButton?.addEventListener('click', async () => {
        if (!currentFile) return;
        contextMenu.classList.add('hidden');
        if (confirm(`Are you sure you want to delete ${currentFile.name}?`)) {
            try {
                await fileOperations.deleteFile(currentFile.id);
                const row = document.querySelector(`tr[data-file-id="${currentFile.id}"]`);
                row?.remove();
                window.cloudStore.createNotification(`${currentFile.name} deleted successfully`);
            } catch (error) {
                window.cloudStore.createNotification('Failed to delete file');
            }
        }
    });

    renameContextButton?.addEventListener('click', () => {
        if (!currentFile) return;
        contextMenu.classList.add('hidden');
        const newName = prompt('Enter new name:', currentFile.name);
        if (newName && newName !== currentFile.name) {
            const row = document.querySelector(`tr[data-file-id="${currentFile.id}"]`);
            if (row) {
                row.querySelector('.text-gray-900').textContent = newName;
                window.cloudStore.createNotification('File renamed successfully');
            }
        }
    });

    // Search functionality
    const searchInput = document.querySelector('input[type="search"]');
    searchInput?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const fileRows = document.querySelectorAll('tbody tr');
        
        fileRows.forEach(row => {
            const fileName = row.querySelector('.text-gray-900').textContent.toLowerCase();
            if (fileName.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Initialize file actions
    initializeFileActions();
});

document.addEventListener('DOMContentLoaded', () => {
    initializeFileList();
    initializeUploader();
    initializeContextMenu();
    initializeSearchAndFilter();
});

// File list initialization and animations
function initializeFileList() {
    const fileRows = document.querySelectorAll('tbody tr');
    fileRows.forEach((row, index) => {
        // Add animation with delay
        row.classList.add('list-item');
        row.style.animationDelay = `${index * 0.1}s`;
        
        // Add hover effect
        row.classList.add('hover:bg-gray-50', 'transition-all', 'duration-200');
        
        // Add click animation
        row.addEventListener('click', () => {
            row.classList.add('scale-[0.99]');
            setTimeout(() => row.classList.remove('scale-[0.99]'), 100);
        });
    });
}

// File uploader initialization
function initializeUploader() {
    const uploadArea = document.querySelector('.upload-area');
    if (!uploadArea) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight);
    });

    uploadArea.addEventListener('drop', handleDrop);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        uploadArea.classList.add('border-blue-500', 'bg-blue-50');
    }

    function unhighlight() {
        uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
    }

    function handleDrop(e) {
        const files = e.dataTransfer.files;
        handleFiles(files);
    }
}

// File handling
async function handleFiles(files) {
    const fileList = [...files];
    for (const file of fileList) {
        try {
            await uploadFile(file);
        } catch (error) {
            console.error('Upload failed:', error);
            window.cloudStore.createNotification(`Failed to upload ${file.name}`, 'error');
        }
    }
}

// File upload with progress
async function uploadFile(file) {
    // Create progress element
    const progressRow = createProgressRow(file);
    document.querySelector('tbody').prepend(progressRow);

    try {
        await window.fileOperations.uploadFile(file, (progress) => {
            updateProgress(progressRow, progress);
        });

        // Success animation
        progressRow.classList.add('animate-success');
        setTimeout(() => {
            progressRow.remove();
            // Add final file row with animation
            addFileRow(file);
        }, 1000);

        window.cloudStore.createNotification(`${file.name} uploaded successfully`, 'success');
    } catch (error) {
        progressRow.classList.add('animate-error');
        throw error;
    }
}

// Context menu initialization
function initializeContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    if (!contextMenu) return;

    document.addEventListener('click', () => {
        contextMenu.classList.add('hidden');
    });

    const fileRows = document.querySelectorAll('tbody tr');
    fileRows.forEach(row => {
        row.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const rect = row.getBoundingClientRect();
            showContextMenu(e.clientX, e.clientY, row);
        });
    });
}

// Show context menu
function showContextMenu(x, y, targetRow) {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.classList.remove('hidden');
    contextMenu.classList.add('animate-scale');

    // Add click handlers
    const downloadButton = contextMenu.querySelector('button:contains("Download")');
    const shareButton = contextMenu.querySelector('button:contains("Share")');
    const deleteButton = contextMenu.querySelector('button:contains("Delete")');

    downloadButton?.addEventListener('click', () => handleDownload(targetRow));
    shareButton?.addEventListener('click', () => handleShare(targetRow));
    deleteButton?.addEventListener('click', () => handleDelete(targetRow));
}

// Search and filter initialization
function initializeSearchAndFilter() {
    const searchInput = document.querySelector('input[type="search"]');
    const filterSelect = document.querySelector('select[name="filter"]');

    searchInput?.addEventListener('input', (e) => {
        filterFiles(e.target.value, filterSelect?.value);
    });

    filterSelect?.addEventListener('change', (e) => {
        filterFiles(searchInput?.value, e.target.value);
    });
}

// Filter files
function filterFiles(searchTerm = '', filterValue = 'all') {
    const fileRows = document.querySelectorAll('tbody tr');
    fileRows.forEach(row => {
        const fileName = row.querySelector('.text-gray-900')?.textContent.toLowerCase();
        const fileType = row.querySelector('i')?.className.toLowerCase();
        
        const matchesSearch = !searchTerm || fileName?.includes(searchTerm.toLowerCase());
        const matchesFilter = filterValue === 'all' || fileType?.includes(filterValue);

        row.classList.toggle('hidden', !matchesSearch || !matchesFilter);
    });
}

// Helper functions
function createProgressRow(file) {
    const row = document.createElement('tr');
    row.className = 'animate-slide-down';
    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
                <i class="fas fa-file text-gray-400 mr-3"></i>
                <span class="text-sm text-gray-900">${file.name}</span>
            </div>
        </td>
        <td colspan="3" class="px-6 py-4 whitespace-nowrap">
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full w-0 transition-all duration-300"></div>
            </div>
        </td>
    `;
    return row;
}

function updateProgress(row, progress) {
    const progressBar = row.querySelector('.bg-blue-500');
    progressBar.style.width = `${progress}%`;
}

function addFileRow(file) {
    const row = document.createElement('tr');
    row.className = 'animate-slide-down border-b';
    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
                <i class="fas fa-file text-gray-400 mr-3"></i>
                <span class="text-sm text-gray-900">${file.name}</span>
            </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${window.cloudStore.formatFileSize(file.size)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            Just now
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button class="text-gray-600 hover:text-blue-500 transition-colors">
                <i class="fas fa-download"></i>
            </button>
            <button class="text-gray-600 hover:text-blue-500 transition-colors ml-2">
                <i class="fas fa-share"></i>
            </button>
        </td>
    `;
    document.querySelector('tbody').prepend(row);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeFilesView();
    setupUploader();
    setupFolderActions();
    setupFileGrid();
    setupDragAndDrop();
    setupContextMenu();
    loadExampleFiles();
});

// Initialize files view
function initializeFilesView() {
    setupViewToggle();
    setupSortingOptions();
    setupFilterOptions();
    setupBreadcrumbs();
    setupSearchFeatures();
}

// Load example files
function loadExampleFiles() {
    const exampleFiles = [
        {
            id: 1,
            name: 'Project Presentation.pptx',
            type: 'powerpoint',
            size: '5.2 MB',
            modified: '2024-01-15T14:30:00',
            shared: true,
            favorite: true
        },
        {
            id: 2,
            name: 'Financial Report 2023',
            type: 'folder',
            items: 15,
            modified: '2024-01-14T09:15:00',
            shared: true
        },
        {
            id: 3,
            name: 'Product Images',
            type: 'folder',
            items: 48,
            modified: '2024-01-13T16:45:00',
            shared: false
        },
        {
            id: 4,
            name: 'Client Meeting Notes.docx',
            type: 'word',
            size: '258 KB',
            modified: '2024-01-12T11:20:00',
            shared: false,
            favorite: true
        },
        {
            id: 5,
            name: 'Budget Analysis.xlsx',
            type: 'excel',
            size: '1.8 MB',
            modified: '2024-01-11T15:40:00',
            shared: true
        }
    ];

    renderFiles(exampleFiles);
}

// Render files
function renderFiles(files) {
    const container = document.getElementById('file-grid');
    if (!container) return;

    const viewMode = localStorage.getItem('filesViewMode') || 'grid';
    container.className = viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'divide-y';

    container.innerHTML = files.map(file => 
        viewMode === 'grid' ? renderGridItem(file) : renderListItem(file)
    ).join('');

    setupFileActions();
}

// Render grid item
function renderGridItem(file) {
    return `
        <div class="group relative bg-white p-4 rounded-lg border hover:shadow-md transition-all duration-200" 
             data-file-id="${file.id}">
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="p-1 hover:bg-gray-100 rounded-full" onclick="toggleFavorite(${file.id})">
                    <i class="fas fa-star ${file.favorite ? 'text-yellow-400' : 'text-gray-400'}"></i>
                </button>
                <button class="p-1 hover:bg-gray-100 rounded-full" onclick="showFileMenu(event, ${file.id})">
                    <i class="fas fa-ellipsis-v text-gray-400"></i>
                </button>
            </div>
            <div class="flex flex-col items-center">
                <div class="w-16 h-16 mb-3 flex items-center justify-center">
                    <i class="fas ${getFileIcon(file.type)} ${getFileColor(file.type)} text-3xl"></i>
                </div>
                <div class="text-center">
                    <p class="font-medium text-gray-900 truncate max-w-[180px]">${file.name}</p>
                    <p class="text-sm text-gray-500">
                        ${file.type === 'folder' ? `${file.items} items` : file.size}
                    </p>
                </div>
                ${file.shared ? `
                    <span class="absolute top-2 left-2 text-blue-500">
                        <i class="fas fa-users text-sm"></i>
                    </span>
                ` : ''}
            </div>
        </div>
    `;
}

// Render list item
function renderListItem(file) {
    return `
        <div class="group flex items-center py-3 px-4 hover:bg-gray-50 transition-colors" 
             data-file-id="${file.id}">
            <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <i class="fas ${getFileIcon(file.type)} ${getFileColor(file.type)} text-xl"></i>
            </div>
            <div class="ml-3 flex-1 min-w-0">
                <div class="flex items-center">
                    <p class="font-medium text-gray-900 truncate">${file.name}</p>
                    ${file.shared ? `
                        <span class="ml-2 text-blue-500">
                            <i class="fas fa-users text-sm"></i>
                        </span>
                    ` : ''}
                </div>
                <p class="text-sm text-gray-500">
                    ${file.type === 'folder' ? `${file.items} items` : file.size} • 
                    Modified ${formatDate(file.modified)}
                </p>
            </div>
            <div class="ml-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="p-1 hover:bg-gray-100 rounded-full" onclick="toggleFavorite(${file.id})">
                    <i class="fas fa-star ${file.favorite ? 'text-yellow-400' : 'text-gray-400'}"></i>
                </button>
                <button class="p-1 hover:bg-gray-100 rounded-full" onclick="showFileMenu(event, ${file.id})">
                    <i class="fas fa-ellipsis-v text-gray-400"></i>
                </button>
            </div>
        </div>
    `;
}

// Setup drag and drop
function setupDragAndDrop() {
    const dropZone = document.getElementById('file-grid');
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    dropZone.addEventListener('drop', handleDrop, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        dropZone.classList.add('bg-blue-50', 'border-blue-300');
    }

    function unhighlight(e) {
        dropZone.classList.remove('bg-blue-50', 'border-blue-300');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = [...dt.files];
        
        files.forEach(file => {
            uploadFile(file);
        });
    }
}

// Upload file
async function uploadFile(file) {
    const progressBar = createProgressBar();
    
    try {
        // Simulate file upload
        for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            updateProgress(progressBar, progress);
        }

        window.cloudStore.createNotification(`${file.name} uploaded successfully`, 'success');
        progressBar.remove();

        // Add file to grid
        const newFile = {
            id: Date.now(),
            name: file.name,
            type: getFileType(file.name),
            size: formatSize(file.size),
            modified: new Date().toISOString(),
            shared: false
        };

        const container = document.getElementById('file-grid');
        const viewMode = localStorage.getItem('filesViewMode') || 'grid';
        const fileElement = document.createElement('div');
        fileElement.innerHTML = viewMode === 'grid' ? renderGridItem(newFile) : renderListItem(newFile);
        container.insertBefore(fileElement.firstChild, container.firstChild);

    } catch (error) {
        window.cloudStore.createNotification(`Failed to upload ${file.name}`, 'error');
        progressBar.remove();
    }
}

// Create progress bar
function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 z-50';
    progressBar.innerHTML = `
        <div class="flex items-center mb-2">
            <i class="fas fa-file-upload text-blue-500 mr-2"></i>
            <span class="text-sm font-medium text-gray-900">Uploading...</span>
        </div>
        <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div class="bg-blue-500 h-full transition-all duration-200" style="width: 0%"></div>
        </div>
    `;
    document.body.appendChild(progressBar);
    return progressBar;
}

// Update progress
function updateProgress(progressBar, progress) {
    const progressElement = progressBar.querySelector('.bg-blue-500');
    if (progressElement) {
        progressElement.style.width = `${progress}%`;
    }
}

// Setup file actions
function setupFileActions() {
    setupDragSelect();
    setupBulkActions();
    setupQuickActions();
}

// Setup drag select
function setupDragSelect() {
    let isDragging = false;
    let startX, startY;
    const selectionBox = document.createElement('div');
    selectionBox.className = 'fixed border-2 border-blue-500 bg-blue-50 bg-opacity-20 pointer-events-none z-50';
    document.body.appendChild(selectionBox);

    document.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        const isFileGrid = e.target.closest('#file-grid');
        if (!isFileGrid) return;

        isDragging = true;
        startX = e.pageX;
        startY = e.pageY;
        selectionBox.style.left = `${startX}px`;
        selectionBox.style.top = `${startY}px`;
        selectionBox.style.width = '0';
        selectionBox.style.height = '0';
        selectionBox.style.display = 'block';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const currentX = e.pageX;
        const currentY = e.pageY;

        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        const left = Math.min(currentX, startX);
        const top = Math.min(currentY, startY);

        selectionBox.style.left = `${left}px`;
        selectionBox.style.top = `${top}px`;
        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;

        // Check for intersecting files
        const files = document.querySelectorAll('[data-file-id]');
        files.forEach(file => {
            const rect = file.getBoundingClientRect();
            const isIntersecting = !(
                left > rect.right + window.scrollX ||
                left + width < rect.left + window.scrollX ||
                top > rect.bottom + window.scrollY ||
                top + height < rect.top + window.scrollY
            );
            file.classList.toggle('bg-blue-50', isIntersecting);
        });
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        selectionBox.style.display = 'none';

        // Get selected files
        const selectedFiles = document.querySelectorAll('.bg-blue-50[data-file-id]');
        selectedFiles.forEach(file => {
            file.classList.remove('bg-blue-50');
        });

        if (selectedFiles.length > 0) {
            showBulkActions(selectedFiles);
        }
    });
}

// Show bulk actions
function showBulkActions(selectedFiles) {
    const existingMenu = document.querySelector('.bulk-actions-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.className = 'bulk-actions-menu fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 z-50 animate-slide-up';
    menu.innerHTML = `
        <div class="flex items-center space-x-2">
            <span class="text-sm font-medium text-gray-900">${selectedFiles.length} selected</span>
            <div class="h-4 border-l border-gray-300"></div>
            <button class="p-2 hover:bg-gray-100 rounded-lg" onclick="downloadSelected()">
                <i class="fas fa-download text-gray-600"></i>
            </button>
            <button class="p-2 hover:bg-gray-100 rounded-lg" onclick="shareSelected()">
                <i class="fas fa-share-alt text-gray-600"></i>
            </button>
            <button class="p-2 hover:bg-gray-100 rounded-lg" onclick="moveSelected()">
                <i class="fas fa-folder-open text-gray-600"></i>
            </button>
            <button class="p-2 hover:bg-red-100 rounded-lg" onclick="deleteSelected()">
                <i class="fas fa-trash text-red-600"></i>
            </button>
        </div>
    `;
    document.body.appendChild(menu);

    // Remove menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
        }
    });
}

// Setup context menu
function setupContextMenu() {
    document.addEventListener('contextmenu', (e) => {
        const fileElement = e.target.closest('[data-file-id]');
        if (!fileElement) return;

        e.preventDefault();
        showContextMenu(e, fileElement.dataset.fileId);
    });
}

// Show context menu
function showContextMenu(e, fileId) {
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.className = 'context-menu fixed bg-white rounded-lg shadow-lg py-2 z-50 w-48 animate-scale-up';
    menu.innerHTML = `
        <button class="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm" onclick="openFile(${fileId})">
            <i class="fas fa-folder-open w-5"></i> Open
        </button>
        <button class="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm" onclick="downloadFile(${fileId})">
            <i class="fas fa-download w-5"></i> Download
        </button>
        <button class="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm" onclick="shareFile(${fileId})">
            <i class="fas fa-share-alt w-5"></i> Share
        </button>
        <button class="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm" onclick="renameFile(${fileId})">
            <i class="fas fa-edit w-5"></i> Rename
        </button>
        <hr class="my-2">
        <button class="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm" onclick="moveFile(${fileId})">
            <i class="fas fa-folder-open w-5"></i> Move to
        </button>
        <button class="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm" onclick="copyFile(${fileId})">
            <i class="fas fa-copy w-5"></i> Copy to
        </button>
        <hr class="my-2">
        <button class="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 text-sm" onclick="deleteFile(${fileId})">
            <i class="fas fa-trash w-5"></i> Delete
        </button>
    `;

    // Position menu
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;

    // Adjust position if menu would go off screen
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        menu.style.left = `${e.pageX - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
        menu.style.top = `${e.pageY - rect.height}px`;
    }

    document.body.appendChild(menu);

    // Remove menu when clicking outside
    document.addEventListener('click', () => {
        menu.remove();
    });
}

// Helper functions
function getFileIcon(type) {
    const icons = {
        folder: 'fa-folder',
        pdf: 'fa-file-pdf',
        word: 'fa-file-word',
        excel: 'fa-file-excel',
        powerpoint: 'fa-file-powerpoint',
        image: 'fa-file-image',
        video: 'fa-file-video',
        audio: 'fa-file-audio',
        code: 'fa-file-code',
        archive: 'fa-file-archive'
    };
    return icons[type] || 'fa-file';
}

function getFileColor(type) {
    const colors = {
        folder: 'text-blue-500',
        pdf: 'text-red-500',
        word: 'text-blue-600',
        excel: 'text-green-600',
        powerpoint: 'text-orange-500',
        image: 'text-purple-500',
        video: 'text-pink-500',
        audio: 'text-yellow-500',
        code: 'text-gray-600',
        archive: 'text-gray-500'
    };
    return colors[type] || 'text-gray-400';
}

function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = {
        pdf: 'pdf',
        doc: 'word', docx: 'word',
        xls: 'excel', xlsx: 'excel',
        ppt: 'powerpoint', pptx: 'powerpoint',
        jpg: 'image', jpeg: 'image', png: 'image', gif: 'image',
        mp4: 'video', avi: 'video', mov: 'video',
        mp3: 'audio', wav: 'audio',
        js: 'code', css: 'code', html: 'code',
        zip: 'archive', rar: 'archive', '7z': 'archive'
    };
    return typeMap[ext] || 'file';
}

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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

// Load files and folders
async function loadFilesAndFolders() {
    const mockFiles = [
        {
            id: 1,
            name: 'Project Documentation',
            type: 'folder',
            size: '150 MB',
            modified: '2024-01-15T10:30:00',
            shared: true,
            favorite: true,
            items: 15
        },
        {
            id: 2,
            name: 'Annual Report 2023.pdf',
            type: 'pdf',
            size: '8.5 MB',
            modified: '2024-01-14T15:45:00',
            shared: true,
            favorite: false
        },
        {
            id: 3,
            name: 'Marketing Campaign.zip',
            type: 'archive',
            size: '250 MB',
            modified: '2024-01-13T09:15:00',
            shared: false,
            favorite: false
        },
        {
            id: 4,
            name: 'Team Photos',
            type: 'folder',
            size: '1.2 GB',
            modified: '2024-01-12T14:20:00',
            shared: true,
            favorite: true,
            items: 48
        },
        {
            id: 5,
            name: 'Product Demo.mp4',
            type: 'video',
            size: '720 MB',
            modified: '2024-01-11T16:30:00',
            shared: false,
            favorite: true
        }
    ];

    renderFiles(mockFiles);
    setupFileActions();
    initializeFileUploader();
    setupFiltersAndSort();
}

function renderFiles(files) {
    const container = document.querySelector('#files-container');
    if (!container) return;

    const viewMode = localStorage.getItem('viewMode') || 'grid';
    container.className = viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2';

    container.innerHTML = files.map(file => viewMode === 'grid' ? renderGridItem(file) : renderListItem(file)).join('');
}

function renderGridItem(file) {
    return `
        <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow" data-file-id="${file.id}">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="text-2xl ${getFileColor(file.type)}">
                        <i class="fas ${getFileIcon(file.type)}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-sm font-medium text-gray-900 truncate">${file.name}</h3>
                        <p class="text-xs text-gray-500">${file.size}</p>
                    </div>
                </div>
                <button class="text-gray-400 hover:text-gray-600" onclick="toggleFileMenu(${file.id}, event)">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500">
                <span>Modified ${formatDate(file.modified)}</span>
                <div class="flex items-center space-x-2">
                    ${file.shared ? '<i class="fas fa-users"></i>' : ''}
                    ${file.favorite ? '<i class="fas fa-star text-yellow-400"></i>' : ''}
                </div>
            </div>
        </div>
    `;
}

function renderListItem(file) {
    return `
        <div class="bg-white p-3 rounded-lg shadow hover:shadow-md transition-shadow flex items-center justify-between" data-file-id="${file.id}">
            <div class="flex items-center space-x-4 flex-1">
                <div class="text-xl ${getFileColor(file.type)}">
                    <i class="fas ${getFileIcon(file.type)}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-gray-900 truncate">${file.name}</h3>
                    <p class="text-xs text-gray-500">
                        ${file.size} • Modified ${formatDate(file.modified)}
                        ${file.type === 'folder' ? ` • ${file.items} items` : ''}
                    </p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                    ${file.shared ? '<i class="fas fa-users text-gray-400"></i>' : ''}
                    ${file.favorite ? '<i class="fas fa-star text-yellow-400"></i>' : ''}
                </div>
                <div class="flex items-center space-x-2">
                    <button class="p-2 hover:bg-gray-100 rounded-full" onclick="previewFile(${file.id})">
                        <i class="fas fa-eye text-gray-400"></i>
                    </button>
                    <button class="p-2 hover:bg-gray-100 rounded-full" onclick="shareFile(${file.id})">
                        <i class="fas fa-share-alt text-gray-400"></i>
                    </button>
                    <button class="p-2 hover:bg-gray-100 rounded-full" onclick="toggleFileMenu(${file.id}, event)">
                        <i class="fas fa-ellipsis-v text-gray-400"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Initialize file uploader with drag and drop
function initializeFileUploader() {
    const dropZone = document.querySelector('#drop-zone');
    if (!dropZone) return;

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

    function highlight(e) {
        dropZone.classList.add('border-blue-500', 'bg-blue-50');
    }

    function unhighlight(e) {
        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
}

// Handle uploaded files
async function handleFiles(files) {
    for (const file of files) {
        await uploadFile(file);
    }
}

// Upload file with progress
async function uploadFile(file) {
    const progressBar = createProgressBar(file.name);
    
    try {
        // Simulate file upload with progress
        for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            updateProgress(progressBar, progress);
        }

        window.cloudStore.createNotification(`${file.name} uploaded successfully`);
        progressBar.remove();
        
        // Refresh file list
        loadFilesAndFolders();
    } catch (error) {
        window.cloudStore.createNotification(`Failed to upload ${file.name}`, 'error');
        progressBar.remove();
    }
}

// Create progress bar for upload
function createProgressBar(fileName) {
    const container = document.createElement('div');
    container.className = 'fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80';
    container.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-900 truncate">${fileName}</span>
            <button class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 transition-all duration-200" style="width: 0%"></div>
        </div>
    `;
    document.body.appendChild(container);
    return container;
}

// Update progress bar
function updateProgress(progressBar, progress) {
    const bar = progressBar.querySelector('.bg-blue-500');
    bar.style.width = `${progress}%`;
}

// File preview
async function previewFile(fileId) {
    const mockPreviewData = {
        1: { type: 'folder', items: ['Document 1.pdf', 'Image.jpg', 'Spreadsheet.xlsx'] },
        2: { type: 'pdf', url: 'path/to/pdf' },
        3: { type: 'archive', contents: ['file1.txt', 'file2.jpg', 'file3.doc'] },
        4: { type: 'folder', items: ['Team1.jpg', 'Team2.jpg', 'Team3.jpg'] },
        5: { type: 'video', url: 'path/to/video' }
    };

    const data = mockPreviewData[fileId];
    if (!data) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-2xl w-full mx-4">
            <div class="flex items-center justify-between p-4 border-b">
                <h3 class="text-lg font-medium text-gray-900">Preview</h3>
                <button onclick="this.closest('.fixed').remove()">
                    <i class="fas fa-times text-gray-400 hover:text-gray-600"></i>
                </button>
            </div>
            <div class="p-4">
                ${renderPreview(data)}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function renderPreview(data) {
    switch (data.type) {
        case 'folder':
            return `
                <div class="space-y-2">
                    ${data.items.map(item => `
                        <div class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                            <i class="fas ${getFileIcon(item.split('.').pop())} ${getFileColor(item.split('.').pop())}"></i>
                            <span class="text-sm text-gray-900">${item}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        case 'pdf':
            return `
                <div class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-file-pdf text-4xl text-red-500"></i>
                </div>
            `;
        case 'video':
            return `
                <div class="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <i class="fas fa-play-circle text-4xl text-white"></i>
                </div>
            `;
        case 'archive':
            return `
                <div class="space-y-2">
                    <div class="text-sm text-gray-500 mb-2">Archive contents:</div>
                    ${data.contents.map(item => `
                        <div class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                            <i class="fas ${getFileIcon(item.split('.').pop())} ${getFileColor(item.split('.').pop())}"></i>
                            <span class="text-sm text-gray-900">${item}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        default:
            return '<div class="text-center text-gray-500">Preview not available</div>';
    }
}

// Setup filters and sorting
function setupFiltersAndSort() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    const sortSelect = document.querySelector('#sort-select');
    const viewToggle = document.querySelector('#view-toggle');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => {
                btn.classList.toggle('bg-blue-50', btn === button);
                btn.classList.toggle('text-blue-600', btn === button);
            });
            applyFilters();
        });
    });

    sortSelect?.addEventListener('change', applyFilters);
    
    viewToggle?.addEventListener('click', () => {
        const currentView = localStorage.getItem('viewMode') || 'grid';
        const newView = currentView === 'grid' ? 'list' : 'grid';
        localStorage.setItem('viewMode', newView);
        loadFilesAndFolders();
    });
}

// Helper functions
function getFileIcon(type) {
    const icons = {
        folder: 'fa-folder',
        pdf: 'fa-file-pdf',
        archive: 'fa-file-archive',
        video: 'fa-file-video',
        doc: 'fa-file-word',
        xls: 'fa-file-excel',
        jpg: 'fa-file-image',
        png: 'fa-file-image'
    };
    return icons[type] || 'fa-file';
}

function getFileColor(type) {
    const colors = {
        folder: 'text-blue-500',
        pdf: 'text-red-500',
        archive: 'text-yellow-500',
        video: 'text-purple-500',
        doc: 'text-blue-500',
        xls: 'text-green-500',
        jpg: 'text-pink-500',
        png: 'text-pink-500'
    };
    return colors[type] || 'text-gray-500';
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFilesAndFolders();
});

// Initialize file management
document.addEventListener('DOMContentLoaded', () => {
    setupFileExplorer();
    setupUploader();
    setupContextMenu();
    setupBatchOperations();
    setupSearchAndFilter();
    setupSortingOptions();
    setupViewMode();
    setupDragAndDrop();
});

// Setup file explorer with breadcrumb navigation
function setupFileExplorer() {
    let currentPath = '/';
    const mockFiles = [
        {
            id: 1,
            name: 'Work Documents',
            type: 'folder',
            size: 0,
            items: 15,
            modified: '2024-01-15T10:30:00Z',
            favorite: true
        },
        {
            id: 2,
            name: 'Project Presentation.pptx',
            type: 'powerpoint',
            size: 5.2 * 1024 * 1024,
            modified: '2024-01-14T15:45:00Z',
            favorite: false
        },
        {
            id: 3,
            name: 'Budget 2024.xlsx',
            type: 'excel',
            size: 2.1 * 1024 * 1024,
            modified: '2024-01-13T09:20:00Z',
            favorite: true
        },
        {
            id: 4,
            name: 'Team Photos',
            type: 'folder',
            size: 0,
            items: 45,
            modified: '2024-01-12T14:15:00Z',
            favorite: false
        }
    ];

    renderFiles(mockFiles);
    setupBreadcrumb(currentPath);
}

// Render files in current view
function renderFiles(files) {
    const container = document.getElementById('file-container');
    const viewMode = localStorage.getItem('viewMode') || 'list';

    if (!container) return;

    if (viewMode === 'grid') {
        container.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4';
        container.innerHTML = files.map(file => `
            <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer" 
                 onclick="handleFileClick(${file.id})"
                 ondragstart="handleDragStart(event, ${file.id})"
                 draggable="true"
                 data-file-id="${file.id}">
                <div class="flex items-center justify-between mb-3">
                    <div class="text-2xl ${getFileTypeColor(file.type)}">
                        <i class="fas ${getFileTypeIcon(file.type)}"></i>
                    </div>
                    <button class="text-gray-400 hover:text-gray-600" onclick="toggleFavorite(${file.id}, event)">
                        <i class="fas ${file.favorite ? 'fa-star text-yellow-400' : 'fa-star'}"></i>
                    </button>
                </div>
                <div class="space-y-1">
                    <h3 class="font-medium text-gray-900 truncate">${file.name}</h3>
                    <p class="text-sm text-gray-500">
                        ${file.type === 'folder' ? `${file.items} items` : formatSize(file.size)}
                    </p>
                    <p class="text-xs text-gray-400">${formatDate(file.modified)}</p>
                </div>
            </div>
        `).join('');
    } else {
        container.className = 'divide-y divide-gray-200';
        container.innerHTML = files.map(file => `
            <div class="hover:bg-gray-50 p-4 flex items-center space-x-4 cursor-pointer"
                 onclick="handleFileClick(${file.id})"
                 ondragstart="handleDragStart(event, ${file.id})"
                 draggable="true"
                 data-file-id="${file.id}">
                <div class="flex-shrink-0 text-2xl ${getFileTypeColor(file.type)}">
                    <i class="fas ${getFileTypeIcon(file.type)}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                        <h3 class="font-medium text-gray-900 truncate">${file.name}</h3>
                        ${file.favorite ? '<i class="fas fa-star text-yellow-400"></i>' : ''}
                    </div>
                    <p class="text-sm text-gray-500">
                        ${file.type === 'folder' ? `${file.items} items` : formatSize(file.size)}
                        • Modified ${formatDate(file.modified)}
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="text-gray-400 hover:text-gray-600" onclick="toggleFavorite(${file.id}, event)">
                        <i class="fas ${file.favorite ? 'fa-star text-yellow-400' : 'fa-star'}"></i>
                    </button>
                    <button class="text-gray-400 hover:text-gray-600" onclick="showFileMenu(event, ${file.id})">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Setup breadcrumb navigation
function setupBreadcrumb(path) {
    const container = document.getElementById('breadcrumb');
    if (!container) return;

    const parts = path.split('/').filter(Boolean);
    container.innerHTML = `
        <button onclick="navigateToPath('/')" class="text-gray-600 hover:text-gray-900">
            <i class="fas fa-home"></i>
        </button>
        ${parts.map((part, index) => `
            <span class="text-gray-400 mx-2">/</span>
            <button onclick="navigateToPath('/${parts.slice(0, index + 1).join('/')}')"
                    class="text-gray-600 hover:text-gray-900 truncate max-w-xs">
                ${part}
            </button>
        `).join('')}
    `;
}

// Setup uploader with progress tracking
function setupUploader() {
    const dropZone = document.createElement('div');
    dropZone.className = 'fixed inset-0 bg-blue-500 bg-opacity-50 z-50 items-center justify-center hidden';
    dropZone.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-lg text-center">
            <i class="fas fa-cloud-upload-alt text-4xl text-blue-500 mb-4"></i>
            <h3 class="text-xl font-medium text-gray-900">Drop files here to upload</h3>
        </div>
    `;
    document.body.appendChild(dropZone);

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.remove('hidden');
        dropZone.classList.add('flex');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('flex');
        dropZone.classList.add('hidden');
    });

    dropZone.addEventListener('drop', handleFileDrop);
}

// Handle file drop
async function handleFileDrop(e) {
    e.preventDefault();
    const dropZone = e.currentTarget;
    dropZone.classList.remove('flex');
    dropZone.classList.add('hidden');

    const files = [...e.dataTransfer.files];
    for (const file of files) {
        await uploadFile(file);
    }
}

// Upload file with progress
async function uploadFile(file) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 mb-4';
    toast.innerHTML = `
        <div class="flex items-center space-x-4">
            <i class="fas fa-file text-blue-500"></i>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">${file.name}</p>
                <div class="mt-1 h-2 bg-gray-200 rounded-full">
                    <div class="h-full bg-blue-500 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(toast);

    try {
        // Simulate upload progress
        const progressBar = toast.querySelector('.bg-blue-500');
        for (let i = 0; i <= 100; i += 10) {
            progressBar.style.width = `${i}%`;
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        window.cloudStore.createNotification(`${file.name} uploaded successfully`, 'success');
        setTimeout(() => toast.remove(), 1000);
    } catch (error) {
        window.cloudStore.createNotification(`Failed to upload ${file.name}`, 'error');
        toast.remove();
    }
}

// Context menu for file operations
function showFileMenu(event, fileId) {
    event.preventDefault();
    event.stopPropagation();

    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.className = 'context-menu fixed bg-white rounded-lg shadow-lg py-2 z-50';
    menu.innerHTML = `
        <button class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100" onclick="downloadFile(${fileId})">
            <i class="fas fa-download w-6"></i> Download
        </button>
        <button class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100" onclick="showSharingModal(${fileId})">
            <i class="fas fa-share-alt w-6"></i> Share
        </button>
        <button class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100" onclick="renameFile(${fileId})">
            <i class="fas fa-edit w-6"></i> Rename
        </button>
        <button class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100" onclick="moveFile(${fileId})">
            <i class="fas fa-folder-open w-6"></i> Move to
        </button>
        <hr class="my-2">
        <button class="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100" onclick="deleteFile(${fileId})">
            <i class="fas fa-trash-alt w-6"></i> Delete
        </button>
    `;

    document.body.appendChild(menu);

    // Position menu
    const x = event.clientX;
    const y = event.clientY;
    const menuWidth = 200;
    const menuHeight = menu.offsetHeight;

    // Adjust position if menu would go off screen
    const posX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
    const posY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

    menu.style.top = `${posY}px`;
    menu.style.left = `${posX}px`;

    // Close menu when clicking outside
    document.addEventListener('click', () => menu.remove(), { once: true });
}

// File operations
async function downloadFile(fileId) {
    window.cloudStore.createNotification('Starting download...', 'info');
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 2000));
    window.cloudStore.createNotification('Download complete', 'success');
}

async function renameFile(fileId) {
    const fileName = prompt('Enter new name:');
    if (!fileName) return;

    try {
        window.cloudStore.createNotification('Renaming file...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.cloudStore.createNotification('File renamed successfully', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to rename file', 'error');
    }
}

async function moveFile(fileId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Move to folder</h3>
            <div class="max-h-64 overflow-y-auto">
                <div class="space-y-2">
                    <button class="w-full flex items-center p-2 hover:bg-gray-100 rounded-lg">
                        <i class="fas fa-folder text-yellow-500 mr-3"></i>
                        <span>Documents</span>
                    </button>
                    <button class="w-full flex items-center p-2 hover:bg-gray-100 rounded-lg">
                        <i class="fas fa-folder text-yellow-500 mr-3"></i>
                        <span>Pictures</span>
                    </button>
                    <button class="w-full flex items-center p-2 hover:bg-gray-100 rounded-lg">
                        <i class="fas fa-folder text-yellow-500 mr-3"></i>
                        <span>Downloads</span>
                    </button>
                </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button onclick="this.closest('.fixed').remove()" 
                        class="px-4 py-2 text-gray-500 hover:text-gray-700">
                    Cancel
                </button>
                <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Move
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
        window.cloudStore.createNotification('Deleting file...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.cloudStore.createNotification('File deleted successfully', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to delete file', 'error');
    }
}

async function toggleFavorite(fileId, event) {
    event.stopPropagation();
    const button = event.currentTarget;
    const icon = button.querySelector('i');
    
    try {
        const isFavorite = icon.classList.contains('text-yellow-400');
        icon.classList.toggle('text-yellow-400');
        
        window.cloudStore.createNotification(
            `File ${isFavorite ? 'removed from' : 'added to'} favorites`,
            'success'
        );
    } catch (error) {
        window.cloudStore.createNotification('Failed to update favorite status', 'error');
    }
}

// Setup batch operations
function setupBatchOperations() {
    const container = document.getElementById('batch-operations');
    if (!container) return;

    container.innerHTML = `
        <div class="flex items-center space-x-4 p-4 bg-white shadow rounded-lg">
            <div class="flex items-center">
                <input type="checkbox" 
                       class="h-4 w-4 text-blue-500 rounded border-gray-300"
                       onchange="toggleSelectAll(this)">
                <span class="ml-2 text-sm text-gray-600">Select All</span>
            </div>
            <div class="flex items-center space-x-2" id="batch-actions" style="display: none;">
                <button onclick="batchDownload()" 
                        class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                    <i class="fas fa-download"></i> Download
                </button>
                <button onclick="batchMove()" 
                        class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                    <i class="fas fa-folder-open"></i> Move
                </button>
                <button onclick="batchDelete()" 
                        class="px-3 py-1 text-sm text-red-600 hover:text-red-900">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// Toggle select all files
function toggleSelectAll(checkbox) {
    const fileCheckboxes = document.querySelectorAll('[data-file-checkbox]');
    const batchActions = document.getElementById('batch-actions');
    
    fileCheckboxes.forEach(box => box.checked = checkbox.checked);
    batchActions.style.display = checkbox.checked ? 'flex' : 'none';
}

// Batch operations handlers
async function batchDownload() {
    const selectedFiles = getSelectedFiles();
    if (selectedFiles.length === 0) return;

    try {
        window.cloudStore.createNotification('Preparing download...', 'info');
        await new Promise(resolve => setTimeout(resolve, 2000));
        window.cloudStore.createNotification('Files downloaded successfully', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to download files', 'error');
    }
}

async function batchMove() {
    const selectedFiles = getSelectedFiles();
    if (selectedFiles.length === 0) return;

    moveFile(); // Reuse single file move modal
}

async function batchDelete() {
    const selectedFiles = getSelectedFiles();
    if (selectedFiles.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)) return;

    try {
        window.cloudStore.createNotification('Deleting files...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1500));
        window.cloudStore.createNotification('Files deleted successfully', 'success');
    } catch (error) {
        window.cloudStore.createNotification('Failed to delete files', 'error');
    }
}

// Get selected files
function getSelectedFiles() {
    return Array.from(document.querySelectorAll('[data-file-checkbox]:checked'))
        .map(checkbox => checkbox.closest('[data-file-id]').dataset.fileId);
}

// Helper functions
function getFileTypeIcon(type) {
    const icons = {
        folder: 'fa-folder',
        pdf: 'fa-file-pdf',
        word: 'fa-file-word',
        excel: 'fa-file-excel',
        powerpoint: 'fa-file-powerpoint',
        image: 'fa-file-image',
        video: 'fa-file-video',
        audio: 'fa-file-audio',
        archive: 'fa-file-archive'
    };
    return icons[type] || 'fa-file';
}

function getFileTypeColor(type) {
    const colors = {
        folder: 'text-yellow-500',
        pdf: 'text-red-500',
        word: 'text-blue-500',
        excel: 'text-green-500',
        powerpoint: 'text-orange-500',
        image: 'text-purple-500',
        video: 'text-pink-500',
        audio: 'text-indigo-500',
        archive: 'text-gray-500'
    };
    return colors[type] || 'text-gray-500';
}

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes} minutes ago`;
        }
        return `${hours} hours ago`;
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return `${days} days ago`;
    }

    return d.toLocaleDateString();
}

// Setup search and filter functionality
function setupSearchAndFilter() {
    const searchInput = document.getElementById('file-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const files = document.querySelectorAll('[data-file-id]');

        files.forEach(file => {
            const fileName = file.querySelector('h3').textContent.toLowerCase();
            file.style.display = fileName.includes(query) ? '' : 'none';
        });
    });
}

// Setup sorting options
function setupSortingOptions() {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', () => {
        const [property, direction] = sortSelect.value.split('-');
        sortFiles(property, direction);
    });
}

// Sort files
function sortFiles(property, direction) {
    const container = document.getElementById('file-container');
    if (!container) return;

    const files = Array.from(container.children);
    files.sort((a, b) => {
        let valueA, valueB;

        switch (property) {
            case 'name':
                valueA = a.querySelector('h3').textContent;
                valueB = b.querySelector('h3').textContent;
                break;
            case 'date':
                valueA = new Date(a.dataset.modified);
                valueB = new Date(b.dataset.modified);
                break;
            case 'size':
                valueA = parseInt(a.dataset.size);
                valueB = parseInt(b.dataset.size);
                break;
        }

        if (direction === 'asc') {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });

    container.innerHTML = '';
    files.forEach(file => container.appendChild(file));
}

// Setup view mode toggle
function setupViewMode() {
    const viewToggle = document.getElementById('view-toggle');
    if (!viewToggle) return;

    const currentView = localStorage.getItem('viewMode') || 'list';
    viewToggle.innerHTML = `
        <button class="p-2 ${currentView === 'grid' ? 'text-blue-500' : 'text-gray-500'}" onclick="changeView('grid')">
            <i class="fas fa-grid-2"></i>
        </button>
        <button class="p-2 ${currentView === 'list' ? 'text-blue-500' : 'text-gray-500'}" onclick="changeView('list')">
            <i class="fas fa-list"></i>
        </button>
    `;
}

// Change view mode
function changeView(mode) {
    localStorage.setItem('viewMode', mode);
    setupFileExplorer(); // Re-render files in new view mode
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    const fileContainer = document.getElementById('file-container');
    if (!fileContainer) return;

    fileContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dropTarget = e.target.closest('[data-file-id]');
        if (dropTarget && dropTarget.querySelector('.fas-folder')) {
            dropTarget.classList.add('bg-blue-50');
        }
    });

    fileContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        const dropTarget = e.target.closest('[data-file-id]');
        if (dropTarget) {
            dropTarget.classList.remove('bg-blue-50');
        }
    });

    fileContainer.addEventListener('drop', handleFileDrop);
}

// Handle drag start
function handleDragStart(event, fileId) {
    event.dataTransfer.setData('text/plain', fileId);
    event.dataTransfer.effectAllowed = 'move';
}