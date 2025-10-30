// Store selected role (default: user)
let selectedRole = 'user';

// Select role function
function selectRole(role) {
    selectedRole = role;
    
    // Update button states
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(btn => {
        if (btn.getAttribute('data-role') === role) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Toggle password visibility
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const eyeIcon = button.querySelector('.eye-icon');
    
    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
    } else {
        input.type = 'password';
        eyeIcon.innerHTML = `
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
    }
}

// Clear error message
function clearError(fieldId) {
    const errorElement = document.getElementById(fieldId + '-error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

// Show error message
function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + '-error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
    }
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

//fuction to show error
function showError(fieldId, message) {
    document.getElementById(`${fieldId}-error`).innerText = message;
}

// Handle Login
function handleLogin() {
    // Clear all previous errors
    clearError('email');
    clearError('password');
    
    // Get input values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    let isValid = true;
    
    // Validate email
    if (!email) {
        showError('email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email');
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        showError('password', 'Password is required');
        isValid = false;
    }
    
    // If validation passes
    if (isValid) {
        // In production, this would call your API
        const loginData = {
            email: email,
            password: password,
            role: selectedRole
        };

        fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
        .then(async (res) => {
            const data = await res.json();
            if (res.ok) {
                alert(`Login successful as ${selectedRole.toUpperCase()}! Redirecting to dashboard...`);

            // Clear form
                document.getElementById('email').value = '';
                document.getElementById('password').value = '';

            // Redirect based on role
                if (selectedRole === 'admin') {
                    window.location.href = '/public/admin_dashboard.html';
                } else {
                    window.location.href = '/public/index.html';
                }
            } else {
                // Show error message from backend
                showError('password', data.error || 'Unknown error');
            }
        })
        .catch((err) => {
            console.error('Request failed:', err);
            alert('Login request failed. Please try again.');
        });
    }
}

// Handle Signup
async function handleSignup() {
    // Clear all previous errors
    clearError('name');
    clearError('email');
    clearError('password');
    clearError('confirm-password');
    
    // Get input values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    
    let isValid = true;
    
    // Validate name
    if (!name) {
        showError('name', 'Name is required');
        isValid = false;
    }
    
    // Validate email
    if (!email) {
        showError('email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email');
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        showError('password', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('password', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword) {
        showError('confirm-password', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirm-password', 'Passwords do not match');
        isValid = false;
    }
    
    // If validation passes
    if (isValid) {
        const signupData = {
            name: name,
            email: email,
            password: password,
            role: selectedRole,
        };

        try {
            const res = await fetch('http://localhost:8080/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupData)
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Signup successful as ${selectedRole.toUpperCase()}! Redirecting to login...`);

                // Clear form
                document.getElementById('name').value = '';
                document.getElementById('email').value = '';
                document.getElementById('password').value = '';
                document.getElementById('confirm-password').value = '';

                // Redirect to login page
                window.location.href = '/';
            } else {
                alert(`Signup failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Request failed:', err);
            alert('Signup request failed. Please try again.');
        }
    }
}



document.addEventListener('DOMContentLoaded', function() {
    // Get all inputs
    const inputs = document.querySelectorAll('input');
    
    // Clear errors on input
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (typeof clearError === 'function') {
                clearError(this.id);
            }
        });
        
        // Add Enter key listener to each input
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                
                // Check which page we're on and call appropriate function
                const path = window.location.pathname;
                
                // Check if it's login page
                if (path === '/' || path.includes('login')) {
                    if (typeof handleLogin === 'function') {
                        handleLogin();
                    }
                } 
                // Check if it's signup page
                else if (path.includes('signup')) {
                    if (typeof handleSignup === 'function') {
                        handleSignup();
                    }
                }
            }
        });
    });
});
