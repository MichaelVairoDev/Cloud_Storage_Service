document.addEventListener('DOMContentLoaded', () => {
    initializeRegistration();
    setupPasswordStrengthMeter();
    setupSocialSignup();
    setupFormValidation();
});

// Initialize registration
function initializeRegistration() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        const formData = new FormData(form);
        await handleRegistration(formData);
    });
}

// Setup password strength meter
function setupPasswordStrengthMeter() {
    const passwordInput = document.querySelector('input[type="password"]');
    const strengthMeter = document.createElement('div');
    strengthMeter.className = 'mt-1';
    strengthMeter.innerHTML = `
        <div class="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gray-400 transition-all duration-300" style="width: 0%"></div>
        </div>
        <p class="text-xs text-gray-500 mt-1">Password strength: <span>weak</span></p>
    `;

    passwordInput?.parentElement?.appendChild(strengthMeter);

    passwordInput?.addEventListener('input', (e) => {
        const password = e.target.value;
        const strength = checkPasswordStrength(password);
        updateStrengthMeter(strength);
    });
}

// Check password strength
function checkPasswordStrength(password) {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    
    // Character types
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;
    
    return {
        score,
        label: score < 40 ? 'weak' : score < 70 ? 'moderate' : 'strong',
        color: score < 40 ? 'red' : score < 70 ? 'yellow' : 'green'
    };
}

// Update strength meter
function updateStrengthMeter(strength) {
    const meter = document.querySelector('.bg-gray-400');
    const label = document.querySelector('.text-gray-500 span');
    
    if (!meter || !label) return;

    meter.style.width = `${strength.score}%`;
    meter.className = `h-full transition-all duration-300 bg-${strength.color}-500`;
    label.textContent = strength.label;
}

// Setup social signup
function setupSocialSignup() {
    const socialButtons = document.querySelectorAll('[data-social]');
    socialButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const provider = button.dataset.social;
            await handleSocialSignup(provider);
        });
    });
}

// Handle social signup
async function handleSocialSignup(provider) {
    try {
        // Show loading state
        const button = document.querySelector(`[data-social="${provider}"]`);
        const originalContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Connecting...
            </div>
        `;

        // Simulate OAuth flow
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Use auth class for social login
        const user = await window.auth.socialLogin(provider);
        
        showSuccessMessage('Registration successful!');
        redirectToDashboard();

    } catch (error) {
        showErrorMessage(`Failed to connect with ${provider}`);
        
        // Reset button state
        const button = document.querySelector(`[data-social="${provider}"]`);
        button.disabled = false;
        button.innerHTML = originalContent;
    }
}

// Setup form validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
        // Show validation message on blur
        input.addEventListener('blur', () => {
            validateInput(input);
        });

        // Remove error on focus
        input.addEventListener('focus', () => {
            const errorElement = input.parentElement.querySelector('.text-red-500');
            if (errorElement) {
                errorElement.remove();
            }
            input.classList.remove('border-red-500');
        });
    });
}

// Validate single input
function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (input.type) {
        case 'email':
            if (!value) {
                isValid = false;
                errorMessage = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;

        case 'password':
            if (!value) {
                isValid = false;
                errorMessage = 'Password is required';
            } else if (value.length < 8) {
                isValid = false;
                errorMessage = 'Password must be at least 8 characters long';
            }
            break;

        case 'text':
            if (!value) {
                isValid = false;
                errorMessage = `${input.placeholder || 'This field'} is required`;
            }
            break;
    }

    // Show/hide error message
    const existingError = input.parentElement.querySelector('.text-red-500');
    if (existingError) {
        existingError.remove();
    }

    if (!isValid) {
        input.classList.add('border-red-500');
        const errorElement = document.createElement('p');
        errorElement.className = 'text-red-500 text-xs mt-1';
        errorElement.textContent = errorMessage;
        input.parentElement.appendChild(errorElement);
    } else {
        input.classList.remove('border-red-500');
    }

    return isValid;
}

// Validate entire form
function validateForm() {
    const inputs = document.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    return isValid;
}

// Handle registration
async function handleRegistration(formData) {
    const submitButton = document.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Creating account...
            </div>
        `;

        // Use auth class for registration
        const user = await window.auth.register(
            formData.get('name'),
            formData.get('email'),
            formData.get('password')
        );

        showSuccessMessage('Registration successful!');
        redirectToDashboard();

    } catch (error) {
        showErrorMessage('Registration failed. Please try again.');
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Show success message
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded';
    notification.role = 'alert';
    notification.innerHTML = `
        <strong class="font-bold">Success!</strong>
        <span class="block sm:inline">${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Show error message
function showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded';
    notification.role = 'alert';
    notification.innerHTML = `
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline">${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Redirect to dashboard
function redirectToDashboard() {
    setTimeout(() => {
        window.location.href = '/dashboard';
    }, 1500);
}