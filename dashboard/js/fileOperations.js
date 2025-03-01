// IndexedDB setup for offline storage
let db;
const DB_NAME = 'cloudstore';
const DB_VERSION = 1;
const STORES = {
    FILES: 'files',
    PENDING_UPLOADS: 'pendingUploads',
    PENDING_ACTIONS: 'pendingActions'
};

// Initialize IndexedDB
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Files store
            if (!db.objectStoreNames.contains(STORES.FILES)) {
                db.createObjectStore(STORES.FILES, { keyPath: 'id' });
            }
            
            // Pending uploads store
            if (!db.objectStoreNames.contains(STORES.PENDING_UPLOADS)) {
                db.createObjectStore(STORES.PENDING_UPLOADS, { keyPath: 'id' });
            }
            
            // Pending actions store
            if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
                db.createObjectStore(STORES.PENDING_ACTIONS, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
};

// File serialization helpers
function serializeFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve({
                id: `${Date.now()}-${file.name}`,
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                data: reader.result
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function deserializeFile(serializedFile) {
    return fetch(serializedFile.data)
        .then(res => res.blob())
        .then(blob => new File([blob], serializedFile.name, {
            type: serializedFile.type,
            lastModified: serializedFile.lastModified
        }));
}

// File operations class
class FileOperations {
    constructor() {
        this.uploadQueue = new Map();
        this.downloadQueue = new Map();
        this.setupDropZone();
        this.setupProgressTracking();
        this.initializeOfflineSupport();
    }

    // Setup drag and drop zone
    setupDropZone() {
        const dropZone = document.querySelector('.upload-area');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        dropZone.addEventListener('dragenter', () => {
            dropZone.classList.add('border-blue-500', 'bg-blue-50');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
        });

        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
            const files = Array.from(e.dataTransfer.files);
            this.handleFileUpload(files);
        });

        // File input handling
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                this.handleFileUpload(files);
            });
        }
    }

    // Handle file upload
    async handleFileUpload(files) {
        for (const file of files) {
            const uploadId = Date.now().toString();
            this.uploadQueue.set(uploadId, {
                file,
                progress: 0,
                status: 'pending'
            });

            this.createUploadElement(uploadId, file);
            await this.uploadFile(uploadId);
        }
    }

    // Create upload progress element
    createUploadElement(uploadId, file) {
        const uploadsContainer = document.getElementById('upload-progress') || document.createElement('div');
        uploadsContainer.id = 'upload-progress';
        uploadsContainer.className = 'fixed bottom-4 right-4 space-y-2 z-50';
        
        if (!document.getElementById('upload-progress')) {
            document.body.appendChild(uploadsContainer);
        }

        const uploadElement = document.createElement('div');
        uploadElement.id = `upload-${uploadId}`;
        uploadElement.className = 'bg-white rounded-lg shadow-lg p-4 max-w-sm animate-slide-up';
        uploadElement.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                    <i class="fas ${this.getFileIcon(file.name)} ${this.getFileColor(file.name)} text-lg mr-2"></i>
                    <span class="text-sm font-medium text-gray-900">${file.name}</span>
                </div>
                <button class="text-gray-400 hover:text-gray-600" onclick="window.fileOps.cancelUpload('${uploadId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-500 rounded-full h-2 transition-all duration-300" style="width: 0%"></div>
            </div>
            <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-500">0%</span>
                <span class="text-xs text-gray-500">0 KB/s</span>
            </div>
        `;

        uploadsContainer.appendChild(uploadElement);
    }

    // Upload file with progress
    async uploadFile(uploadId) {
        const upload = this.uploadQueue.get(uploadId);
        if (!upload) return;

        const { file } = upload;
        const chunkSize = 1024 * 1024; // 1MB chunks
        const totalChunks = Math.ceil(file.size / chunkSize);
        let uploadedChunks = 0;

        // Update status
        upload.status = 'uploading';
        this.uploadQueue.set(uploadId, upload);

        try {
            // Simulate chunk upload
            for (let i = 0; i < totalChunks; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                uploadedChunks++;
                const progress = (uploadedChunks / totalChunks) * 100;
                this.updateUploadProgress(uploadId, progress);
            }

            // Upload successful
            this.uploadQueue.delete(uploadId);
            this.showUploadSuccess(uploadId, file.name);

            // Add to file list if exists
            this.addFileToList(file);

        } catch (error) {
            // Handle upload error
            upload.status = 'error';
            this.uploadQueue.set(uploadId, upload);
            this.showUploadError(uploadId, file.name);
        }
    }

    // Update upload progress
    updateUploadProgress(uploadId, progress) {
        const uploadElement = document.getElementById(`upload-${uploadId}`);
        if (!uploadElement) return;

        const progressBar = uploadElement.querySelector('.bg-blue-500');
        const percentageText = uploadElement.querySelector('.text-xs');
        
        progressBar.style.width = `${progress}%`;
        percentageText.textContent = `${Math.round(progress)}%`;
    }

    // Cancel upload
    cancelUpload(uploadId) {
        const upload = this.uploadQueue.get(uploadId);
        if (!upload) return;

        upload.status = 'cancelled';
        this.uploadQueue.delete(uploadId);

        const uploadElement = document.getElementById(`upload-${uploadId}`);
        if (uploadElement) {
            uploadElement.classList.add('animate-fade-out');
            setTimeout(() => uploadElement.remove(), 300);
        }

        window.cloudStore.createNotification('Upload cancelled', 'info');
    }

    // Show upload success
    showUploadSuccess(uploadId, fileName) {
        const uploadElement = document.getElementById(`upload-${uploadId}`);
        if (uploadElement) {
            uploadElement.classList.add('animate-fade-out');
            setTimeout(() => uploadElement.remove(), 2000);
        }

        window.cloudStore.createNotification(`${fileName} uploaded successfully`, 'success');
    }

    // Show upload error
    showUploadError(uploadId, fileName) {
        const uploadElement = document.getElementById(`upload-${uploadId}`);
        if (uploadElement) {
            const progressBar = uploadElement.querySelector('.bg-blue-500');
            progressBar.classList.remove('bg-blue-500');
            progressBar.classList.add('bg-red-500');
            
            setTimeout(() => {
                uploadElement.classList.add('animate-fade-out');
                setTimeout(() => uploadElement.remove(), 300);
            }, 3000);
        }

        window.cloudStore.createNotification(`Failed to upload ${fileName}`, 'error');
    }

    // Add file to list
    addFileToList(file) {
        const filesList = document.getElementById('files-list');
        if (!filesList) return;

        const fileElement = document.createElement('tr');
        fileElement.className = 'hover:bg-gray-50 transition-colors animate-fade-in';
        fileElement.innerHTML = `
            <td class="py-4 px-6 whitespace-nowrap">
                <div class="flex items-center">
                    <i class="fas ${this.getFileIcon(file.name)} ${this.getFileColor(file.name)} text-lg mr-3"></i>
                    <div>
                        <div class="text-sm font-medium text-gray-900">${file.name}</div>
                        <div class="text-xs text-gray-500">Just now</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-500">${this.formatSize(file.size)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-3">
                    <button class="text-gray-400 hover:text-gray-600" onclick="window.fileOps.downloadFile('${file.name}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="text-gray-400 hover:text-gray-600" onclick="window.fileOps.shareFile('${file.name}')">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="text-gray-400 hover:text-gray-600" onclick="window.fileOps.showFileMenu(this, '${file.name}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </td>
        `;

        filesList.insertBefore(fileElement, filesList.firstChild);
    }

    // Download file
    async downloadFile(fileName) {
        const downloadId = Date.now().toString();
        
        try {
            // Show download progress
            this.showDownloadProgress(downloadId, fileName);

            // Simulate download
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Download successful
            this.showDownloadSuccess(downloadId, fileName);

        } catch (error) {
            // Handle download error
            this.showDownloadError(downloadId, fileName);
        }
    }

    // Show download progress
    showDownloadProgress(downloadId, fileName) {
        const downloadsContainer = document.getElementById('download-progress') || document.createElement('div');
        downloadsContainer.id = 'download-progress';
        downloadsContainer.className = 'fixed bottom-4 left-4 space-y-2 z-50';
        
        if (!document.getElementById('download-progress')) {
            document.body.appendChild(downloadsContainer);
        }

        const downloadElement = document.createElement('div');
        downloadElement.id = `download-${downloadId}`;
        downloadElement.className = 'bg-white rounded-lg shadow-lg p-4 max-w-sm animate-slide-up';
        downloadElement.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                    <i class="fas fa-download text-blue-500 mr-2"></i>
                    <span class="text-sm font-medium text-gray-900">${fileName}</span>
                </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-500 rounded-full h-2 transition-all duration-300 w-0"></div>
            </div>
        `;

        downloadsContainer.appendChild(downloadElement);

        // Animate progress
        setTimeout(() => {
            const progressBar = downloadElement.querySelector('.bg-blue-500');
            progressBar.style.width = '100%';
        }, 100);
    }

    // Show download success
    showDownloadSuccess(downloadId, fileName) {
        const downloadElement = document.getElementById(`download-${downloadId}`);
        if (downloadElement) {
            downloadElement.classList.add('animate-fade-out');
            setTimeout(() => downloadElement.remove(), 1000);
        }

        window.cloudStore.createNotification(`${fileName} downloaded successfully`, 'success');
    }

    // Show download error
    showDownloadError(downloadId, fileName) {
        const downloadElement = document.getElementById(`download-${downloadId}`);
        if (downloadElement) {
            const progressBar = downloadElement.querySelector('.bg-blue-500');
            progressBar.classList.remove('bg-blue-500');
            progressBar.classList.add('bg-red-500');
            
            setTimeout(() => {
                downloadElement.classList.add('animate-fade-out');
                setTimeout(() => downloadElement.remove(), 300);
            }, 3000);
        }

        window.cloudStore.createNotification(`Failed to download ${fileName}`, 'error');
    }

    // Share file
    shareFile(fileName) {
        const modal = document.getElementById('sharing-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.dataset.fileName = fileName;
        }
    }

    // Show file menu
    showFileMenu(button, fileName) {
        const existingMenu = document.querySelector('.file-context-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.className = 'file-context-menu absolute bg-white rounded-lg shadow-lg py-2 z-50 animate-scale';
        menu.innerHTML = `
            <button class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center" onclick="window.fileOps.downloadFile('${fileName}')">
                <i class="fas fa-download w-5"></i>
                <span>Download</span>
            </button>
            <button class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center" onclick="window.fileOps.shareFile('${fileName}')">
                <i class="fas fa-share-alt w-5"></i>
                <span>Share</span>
            </button>
            <button class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center" onclick="window.fileOps.renameFile('${fileName}')">
                <i class="fas fa-edit w-5"></i>
                <span>Rename</span>
            </button>
            <button class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center" onclick="window.fileOps.moveFile('${fileName}')">
                <i class="fas fa-folder w-5"></i>
                <span>Move</span>
            </button>
            <hr class="my-2">
            <button class="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 flex items-center" onclick="window.fileOps.deleteFile('${fileName}')">
                <i class="fas fa-trash-alt w-5"></i>
                <span>Delete</span>
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

    // Rename file
    renameFile(fileName) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Rename File</h3>
                <input type="text" value="${fileName}" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <div class="flex justify-end mt-6 space-x-3">
                    <button class="px-4 py-2 text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">Cancel</button>
                    <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" 
                            onclick="window.fileOps.confirmRename('${fileName}', this.parentElement.previousElementSibling.value)">
                        Rename
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Confirm rename
    confirmRename(oldName, newName) {
        if (newName && newName !== oldName) {
            // Simulate rename
            window.cloudStore.createNotification(`Renamed ${oldName} to ${newName}`, 'success');
            
            // Update UI
            const fileElement = document.querySelector(`[data-file-name="${oldName}"]`);
            if (fileElement) {
                fileElement.querySelector('.text-gray-900').textContent = newName;
                fileElement.dataset.fileName = newName;
            }
        }
        document.querySelector('.fixed').remove();
    }

    // Move file
    moveFile(fileName) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Move File</h3>
                <div class="space-y-2">
                    <button class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50" onclick="window.fileOps.confirmMove('${fileName}', 'Documents')">
                        <i class="fas fa-folder text-blue-500 mr-2"></i>Documents
                    </button>
                    <button class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50" onclick="window.fileOps.confirmMove('${fileName}', 'Images')">
                        <i class="fas fa-folder text-green-500 mr-2"></i>Images
                    </button>
                    <button class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50" onclick="window.fileOps.confirmMove('${fileName}', 'Downloads')">
                        <i class="fas fa-folder text-purple-500 mr-2"></i>Downloads
                    </button>
                </div>
                <div class="flex justify-end mt-6">
                    <button class="px-4 py-2 text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Confirm move
    confirmMove(fileName, folder) {
        window.cloudStore.createNotification(`Moved ${fileName} to ${folder}`, 'success');
        document.querySelector('.fixed').remove();

        // Update UI
        const fileElement = document.querySelector(`[data-file-name="${fileName}"]`);
        if (fileElement) {
            fileElement.classList.add('animate-fade-out');
            setTimeout(() => fileElement.remove(), 300);
        }
    }

    // Delete file
    deleteFile(fileName) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale">
                <h3 class="text-lg font-medium text-gray-900 mb-2">Delete File</h3>
                <p class="text-gray-500 mb-4">Are you sure you want to delete ${fileName}? This action cannot be undone.</p>
                <div class="flex justify-end space-x-3">
                    <button class="px-4 py-2 text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">Cancel</button>
                    <button class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" 
                            onclick="window.fileOps.confirmDelete('${fileName}')">
                        Delete
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Confirm delete
    confirmDelete(fileName) {
        window.cloudStore.createNotification(`Deleted ${fileName}`, 'success');
        document.querySelector('.fixed').remove();

        // Update UI
        const fileElement = document.querySelector(`[data-file-name="${fileName}"]`);
        if (fileElement) {
            fileElement.classList.add('animate-fade-out');
            setTimeout(() => fileElement.remove(), 300);
        }
    }

    // Setup progress tracking
    setupProgressTracking() {
        // Track total upload/download progress
        setInterval(() => {
            let totalUploadProgress = 0;
            let activeUploads = 0;

            this.uploadQueue.forEach(upload => {
                if (upload.status === 'uploading') {
                    totalUploadProgress += upload.progress;
                    activeUploads++;
                }
            });

            if (activeUploads > 0) {
                const averageProgress = totalUploadProgress / activeUploads;
                this.updateTotalProgress(averageProgress);
            }
        }, 1000);
    }

    // Update total progress
    updateTotalProgress(progress) {
        const progressElement = document.getElementById('total-progress');
        if (!progressElement) return;

        progressElement.style.width = `${progress}%`;
        progressElement.textContent = `${Math.round(progress)}%`;
    }

    // Initialize offline support
    initializeOfflineSupport() {
        // Check if browser supports ServiceWorker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/worker.js')
                .then(registration => {
                    console.log('ServiceWorker registered');
                    
                    // Setup background sync
                    registration.sync.register('sync-uploads');
                })
                .catch(error => {
                    console.error('ServiceWorker registration failed:', error);
                });
        }

        // Handle offline/online status
        window.addEventListener('online', () => {
            this.processOfflineQueue();
        });
    }

    // Process offline queue
    async processOfflineQueue() {
        const offlineUploads = await this.getOfflineUploads();
        for (const upload of offlineUploads) {
            await this.uploadFile(upload.id);
        }
    }

    // Get offline uploads from IndexedDB
    async getOfflineUploads() {
        // Implementation depends on your IndexedDB structure
        return [];
    }

    // Utility functions
    getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const icons = {
            pdf: 'fa-file-pdf',
            doc: 'fa-file-word',
            docx: 'fa-file-word',
            xls: 'fa-file-excel',
            xlsx: 'fa-file-excel',
            ppt: 'fa-file-powerpoint',
            pptx: 'fa-file-powerpoint',
            jpg: 'fa-file-image',
            jpeg: 'fa-file-image',
            png: 'fa-file-image',
            gif: 'fa-file-image',
            mp4: 'fa-file-video',
            mp3: 'fa-file-audio',
            zip: 'fa-file-archive',
            rar: 'fa-file-archive'
        };
        return icons[ext] || 'fa-file';
    }

    getFileColor(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const colors = {
            pdf: 'text-red-500',
            doc: 'text-blue-500',
            docx: 'text-blue-500',
            xls: 'text-green-500',
            xlsx: 'text-green-500',
            ppt: 'text-orange-500',
            pptx: 'text-orange-500',
            jpg: 'text-purple-500',
            jpeg: 'text-purple-500',
            png: 'text-purple-500',
            gif: 'text-purple-500',
            mp4: 'text-pink-500',
            mp3: 'text-yellow-500',
            zip: 'text-gray-500',
            rar: 'text-gray-500'
        };
        return colors[ext] || 'text-gray-500';
    }

    formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
}

// Initialize file operations
window.fileOps = new FileOperations();