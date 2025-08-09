/* eslint-disable @typescript-eslint/naming-convention */
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

interface ApiClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
}

const createApiClient = (config: ApiClientConfig = {}) => {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseURL) {
    throw new Error("Invalid base URL");
  }
  const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...config.headers,
    },
    timeout: 30000,
  });

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...config.headers,
  };

  const mergeHeaders = (options: AxiosRequestConfig) => ({
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const post = async <T, D>(
    endpoint: string,
    body: D,
    config: AxiosRequestConfig = {},
  ): Promise<{ data: T }> => {
    try {
      const response = await axiosInstance.post(endpoint, body, mergeHeaders(config));
      return { data: response.data };
    } catch (error) {
      throw handleError(error);
    }
  };

  const handleError = (error: unknown): Error => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return new Error(
          `HTTP error! Status: ${error.response.status}, Message: ${JSON.stringify(error.response.data)}`,
        );
      } else if (error.request) {
        return new Error("No response received from the server.");
      }
      return new Error(`Error occurred while setting up the request: ${error.message}`);
    }
    return new Error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  };

  return { post };
};

const apiClient = createApiClient();

export default apiClient;
