import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import { getSession } from 'next-auth/react';

// Types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// Default configuration
const DEFAULT_CONFIG: Required<Pick<ApiClientConfig, 'timeout'>> = {
  timeout: 30000,
};

// Create axios instance factory
const createAxiosInstance = (config: ApiClientConfig = {}): AxiosInstance => {
  const baseURL = config.baseURL || process.env.NEXT_PUBLIC_API_BASE_URL;
  
  if (!baseURL) {
    throw new Error('API base URL is required');
  }

  return axios.create({
    baseURL,
    timeout: config.timeout || DEFAULT_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers,
    },
  });
};

// Error handling
const handleApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || `HTTP ${error.response.status}`,
      status: error.response.status,
    };
  } 
  
  if (error.request) {
    // Network error
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR',
    };
  }
  
  // Request setup error
  return {
    message: error.message || 'An unexpected error occurred',
    code: 'REQUEST_ERROR',
  };
};

// Token refresh handler
const handleUnauthorizedError = async (error: AxiosError): Promise<never> => {
  try {
    const session = await getSession();
    if (session?.user?.accessToken) {
      // Token exists but is invalid - could implement refresh logic here
      console.warn('Token validation failed, session may be expired');
    }
  } catch (refreshError) {
    console.error('Failed to handle unauthorized error:', refreshError);
  }
  
  throw handleApiError(error);
};

// Create the main API client
class ApiClient {
  private instance: AxiosInstance;

  constructor(config: ApiClientConfig = {}) {
    this.instance = createAxiosInstance(config);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth tokens
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(handleApiError(error))
    );

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          return handleUnauthorizedError(error);
        }
        throw handleApiError(error);
      }
    );
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  // Utility methods
  setDefaultHeader(key: string, value: string) {
    this.instance.defaults.headers.common[key] = value;
  }

  removeDefaultHeader(key: string) {
    delete this.instance.defaults.headers.common[key];
  }

  getBaseURL(): string | undefined {
    return this.instance.defaults.baseURL;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };

// Legacy compatibility - matches existing apiClient interface
export const legacyApiClient = {
  get: <T>(url: string, config = {}) => apiClient.get<T>(url, config),
  post: <T>(url: string, options: { data: any; config?: any }) => 
    apiClient.post<T>(url, options.data, options.config),
  put: <T>(url: string, options: { data: any; config?: any }) => 
    apiClient.put<T>(url, options.data, options.config),
  patch: <T>(url: string, options: { data: any; config?: any }) => 
    apiClient.patch<T>(url, options.data, options.config),
  delete: <T>(url: string, config = {}) => apiClient.delete<T>(url, config),
};

export default apiClient;
