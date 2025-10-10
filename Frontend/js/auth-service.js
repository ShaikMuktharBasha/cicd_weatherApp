// Authentication API Service
class AuthService {
    constructor() {
        // Use environment variable for backend URL, fallback to localhost for development
        this.baseURL = window.BACKEND_URL ? `${window.BACKEND_URL}/api` : 'http://localhost:8085/api';
        this.token = localStorage.getItem('authToken');
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
        return await this.request('/user/profile');
    }

    async updateProfile(updates) {
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