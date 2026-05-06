const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api`;

class AuthService {
  constructor() {
    this.TOKEN_KEY = "adminToken";
    this.ADMIN_KEY = "adminData";
  }

  // Login with email and password
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store token and admin data
      localStorage.setItem(this.TOKEN_KEY, data.token);
      localStorage.setItem(this.ADMIN_KEY, JSON.stringify(data.admin));

      return {
        success: true,
        token: data.token,
        admin: data.admin,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get stored admin data
  getAdmin() {
    const adminData = localStorage.getItem(this.ADMIN_KEY);
    return adminData ? JSON.parse(adminData) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Verify token with backend
  async verifyToken() {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await fetch(`${API_URL}/admin/verify-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data.valid;
    } catch (error) {
      return false;
    }
  }

  // Logout
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ADMIN_KEY);
  }

  // Get headers with auth token
  getAuthHeaders() {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Make authenticated API call
  async request(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  }
}

export default new AuthService();
