import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillglide-access-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      console.error('No original request in error:', error);
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest.headers['X-Retry']) {
      try {
        const refreshToken = localStorage.getItem('skillglide-refresh-token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Set retry flag to prevent infinite loop
        originalRequest.headers['X-Retry'] = 'true';

        // Attempt to refresh token
        const response = await axios.post(`${API_BASE_URL}${API_VERSION}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;
        
        // Update tokens in storage
        localStorage.setItem('skillglide-access-token', access_token);
        localStorage.setItem('skillglide-refresh-token', newRefreshToken);

        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear auth data on refresh failure
        localStorage.removeItem('skillglide-access-token');
        localStorage.removeItem('skillglide-refresh-token');
        localStorage.removeItem('skillglide-user');
        
        // Redirect to home page
        window.location.href = '/';
        
        return Promise.reject(refreshError);
      }
    }

    // Format error message for better handling
    let errorMessage = 'An unexpected error occurred';
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Create a new error with the formatted message
    const formattedError = new Error(errorMessage);
    return Promise.reject(formattedError);
  }
);

// Generic API methods with better error handling
export const api = {
  get: <T = any>(url: string, params?: any): Promise<AxiosResponse<T>> => {
    return apiClient.get(url, { params }).catch((error) => {
      console.error(`GET ${url} failed:`, error);
      throw error;
    });
  },
  
  post: <T = any>(url: string, data?: any): Promise<AxiosResponse<T>> => {
    return apiClient.post(url, data).catch((error) => {
      console.error(`POST ${url} failed:`, error);
      throw error;
    });
  },
  
  put: <T = any>(url: string, data?: any): Promise<AxiosResponse<T>> => {
    return apiClient.put(url, data).catch((error) => {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    });
  },
  
  patch: <T = any>(url: string, data?: any): Promise<AxiosResponse<T>> => {
    return apiClient.patch(url, data).catch((error) => {
      console.error(`PATCH ${url} failed:`, error);
      throw error;
    });
  },
  
  delete: <T = any>(url: string): Promise<AxiosResponse<T>> => {
    return apiClient.delete(url).catch((error) => {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    });
  },
  
  upload: <T = any>(url: string, formData: FormData): Promise<AxiosResponse<T>> => {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).catch((error) => {
      console.error(`UPLOAD to ${url} failed:`, error);
      throw error;
    });
  },
  // OTP methods
  sendOtp: (phone: string) => apiClient.post('/users/send-otp', { phone }),
  verifyOtp: (phone: string, otp: string) => apiClient.post('/users/verify-otp', { phone, otp }),
};

export default apiClient;

export async function sendOtp(phone: string) {
  const res = await fetch('http://localhost:8000/send-otp/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function verifyOtp(phone: string, code: string) {
  const res = await fetch('http://localhost:8000/verify-otp/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}