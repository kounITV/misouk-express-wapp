import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { getSession } from "next-auth/react";

declare module "next-auth" {
  interface User {
    accessToken?: string;
  }
}

const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

export interface ApiError {
  message: string;
  status: number;
  data?: any;
}
export interface ErrorResponse {
  data: {
    message: string;
    status: string;
  };
  message: string;
  status: number;
}

interface ApiResponseMeta {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number | null;
  totalCount: number | null;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  meta: ApiResponseMeta;
  result: T[];
}

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const handleUnauthorizedError = async (error: AxiosError) => {
  try {
    const session = await getSession();
    if (session?.user?.accessToken) {
      // Handle token refresh or retry logic here
    }
  } catch (refreshError) {
    return Promise.reject(refreshError);
  }
  return Promise.reject(error);
};

const handleApiError = (error: AxiosError): Promise<ApiError> => {
  const apiError: ApiError = {
    message: error.message || "An error occurred",
    status: error.response?.status || HTTP_STATUS_INTERNAL_SERVER_ERROR,
    data: error.response?.data,
  };
  return Promise.reject(apiError);
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const session = await getSession();
      if (session?.user?.accessToken) {
        config.headers.Authorization = `Bearer ${session.user.accessToken}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async (error: AxiosError) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === HTTP_STATUS_UNAUTHORIZED) {
      return handleUnauthorizedError(error);
    }
    return handleApiError(error);
  },
);

export const apiClient = {
  get: async <T>(url: string, config = {}) =>
    await api.get<T>(url, config).then((response) => response.data),

  post: async <T>(url: string, options: { data: any; config?: any }) =>
    await api.post<T>(url, options.data, options.config).then((response) => response.data),

  put: async <T>(url: string, options: { data: any; config?: any }) =>
    await api.put<T>(url, options.data, options.config).then((response) => response.data),

  patch: async <T>(url: string, options: { data: any; config?: any }) =>
    await api.patch<T>(url, options.data, options.config).then((response) => response.data),

  delete: async <T>(url: string, config = {}) =>
    await api.delete<T>(url, config).then((response) => response.data),
};

export default api;