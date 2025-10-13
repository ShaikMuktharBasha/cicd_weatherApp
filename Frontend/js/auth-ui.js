// Simple Authentication UI
class AuthUI {
    constructor() {
        console.log('🔧 AuthUI constructor called');
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🔧 AuthUI init called');
        this.clearStoredAuth(); // Clear any stored authentication data
        this.setupSimpleLogin();
        this.setupRegistration();
        this.setupGuestMode();
        this.setupFormSwitching();
        // Removed checkAuthStatus() to always show login page first
    }

    clearStoredAuth() {
        // Clear any stored authentication data to force login every time
        authService.logout();
        this.currentUser = null;
    }

    setupSimpleLogin() {
        const loginForm = document.getElementById('simple-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSimpleLogin();
            });
        }
    }

    async handleSimpleLogin() {
        const username = document.getElementById('login-username')?.value?.trim() || '';
        const password = document.getElementById('login-password')?.value || '';

        if (!username) {
            this.showLoginMessage('Please enter a username', 'error');
            return;
        }

        if (!password) {
            this.showLoginMessage('Please enter a password', 'error');
            return;
        }

        try {
            this.showLoginMessage('Signing in...', 'info');

            // Use the auth service to login
            const response = await authService.login({ username, password });

            this.currentUser = { name: username, email: username };
            authService.setCurrentUser(this.currentUser);
            this.showLoginMessage('Login successful!', 'success');

            // Show weather app immediately for faster experience
            this.showWeatherApp();

        } catch (error) {
            this.showLoginMessage(error.message || 'Login failed', 'error');
        }
    }

    setupFormSwitching() {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');

        if (loginTab) {
            loginTab.addEventListener('click', () => this.switchForm('login'));
        }
        if (registerTab) {
            registerTab.addEventListener('click', () => this.switchForm('register'));
        }
    }

    switchForm(formType) {
        // Update tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${formType}-tab`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${formType}-form`).classList.add('active');

        // Clear messages
        this.showLoginMessage('');
    }

    setupRegistration() {
        const registerForm = document.getElementById('register-form-element');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }
    }

    async handleRegistration() {
        const username = document.getElementById('register-username')?.value?.trim() || '';
        const password = document.getElementById('register-password')?.value || '';
        const confirmPassword = document.getElementById('register-confirm-password')?.value || '';

        if (!username) {
            this.showLoginMessage('Please enter a username', 'error');
            return;
        }

        if (!password) {
            this.showLoginMessage('Please enter a password', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showLoginMessage('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showLoginMessage('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            this.showLoginMessage('Creating account...', 'info');

            // Use the auth service to register
            const response = await authService.register({ username, password });

            this.showLoginMessage('Account created successfully! You can now sign in.', 'success');

            // Switch to login form after successful registration
            setTimeout(() => {
                this.switchForm('login');
                // Pre-fill username
                document.getElementById('login-username').value = username;
            }, 1500);
        } catch (error) {
            this.showLoginMessage(error.message || 'Registration failed', 'error');
        }
    }

    setupGuestMode() {
        console.log('🔧 Setting up guest mode');
        const guestBtn = document.getElementById('guest-btn');
        console.log('🔧 Guest button element:', guestBtn);
        if (guestBtn) {
            console.log('🔧 Adding guest button event listener');
            guestBtn.addEventListener('click', () => {
                console.log('🔧 Guest button clicked');
                this.handleGuestMode();
            });
        }
    }

    handleGuestMode() {
        console.log('🔧 Handling guest mode');
        // Set guest user
        this.currentUser = { name: 'Guest', email: 'guest@weatherapp.com', isGuest: true };
        authService.setCurrentUser(this.currentUser);

        // Show weather app immediately
        this.showWeatherApp();
    }

    showWeatherApp() {
        const loginPage = document.getElementById('login-page');
        const screen = document.getElementById('screen');

        if (loginPage) {
            loginPage.style.display = 'none';
        }
        if (screen) {
            screen.style.display = 'block';
        }

        // Initialize weather app
        if (typeof updateLiveDate === 'function') {
            updateLiveDate();
        }
    }

    showLoginMessage(message, type = 'info') {
        const messageEl = document.getElementById('login-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `login-message ${type}`;
        }
    }

    checkAuthStatus() {
        // Check if user is already logged in
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            this.currentUser = currentUser;
            this.showWeatherApp();
        }
    }

    forceShowLoginPage() {
        const loginPage = document.getElementById('login-page');
        const screen = document.getElementById('screen');

        if (loginPage) {
            loginPage.style.display = 'flex';
        }
        if (screen) {
            screen.style.display = 'none';
        }

        // Clear current user
        this.currentUser = null;
        authService.clearCurrentUser();
    }
}

// Initialize auth UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 DOMContentLoaded fired, initializing AuthUI');
    window.authUI = new AuthUI();
});