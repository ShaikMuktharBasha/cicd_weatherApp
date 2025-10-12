// Authentication API Service
class AuthService {
    constructor() {
        // Use Vite environment variable for backend URL, fallback to localhost for development
        this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        this.token = localStorage.getItem('authToken');
        // Check if we're in demo mode (GitHub Pages - no backend available)
        this.isDemoMode = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

        if (this.isDemoMode) {
            console.log('🔧 Weather App running in Demo Mode (GitHub Pages) - Authentication is mocked');
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async register(userData) {
        if (this.isDemoMode) {
            // Mock successful registration in demo mode
            console.log('Demo mode: Mocking user registration for', userData.username);
            const mockToken = 'demo-token-' + Date.now();
            this.setToken(mockToken);
            return {
                message: 'Registration successful (Demo Mode)',
                token: mockToken,
                user: { username: userData.username, email: userData.email }
            };
        }

        const response = await this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async login(credentials) {
        if (this.isDemoMode) {
            // Mock successful login in demo mode
            console.log('Demo mode: Mocking user login for', credentials.username);
            const mockToken = 'demo-token-' + Date.now();
            this.setToken(mockToken);
            return {
                message: 'Login successful (Demo Mode)',
                token: mockToken,
                user: { username: credentials.username, email: credentials.username + '@demo.com' }
            };
        }

        const response = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async getProfile() {
        if (this.isDemoMode) {
            // Mock profile data in demo mode
            const currentUser = this.getCurrentUser();
            return {
                username: currentUser?.username || 'demo-user',
                email: currentUser?.email || 'demo@example.com',
                name: currentUser?.name || 'Demo User'
            };
        }

        return await this.request('/user/profile');
    }

    async updateProfile(updates) {
        if (this.isDemoMode) {
            // Mock profile update in demo mode
            console.log('Demo mode: Mocking profile update', updates);
            return { message: 'Profile updated successfully (Demo Mode)' };
        }

        return await this.request('/user/profile', {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }

    async logout() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    getToken() {
        return this.token;
    }

    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    setCurrentUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }
}

// Global auth service instance
const authService = new AuthService();