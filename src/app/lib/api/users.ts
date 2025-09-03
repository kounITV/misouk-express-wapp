import { apiClient } from '../api-client';
import type { User, CreateUserRequest, UpdateUserRequest, UserListResponse } from '@/types/user';

export const usersApi = {
  // GET /users - Get all users
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<UserListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.status) searchParams.append('status', params.status);

    const query = searchParams.toString();
    const url = query ? `/users?${query}` : '/users';
    
    return apiClient.get<UserListResponse>(url);
  },

  // GET /users/:id - Get user by ID
  getUserById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  // POST /users - Create new user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    return apiClient.post<User>('/users', userData);
  },

  // PUT /users/:id - Update user
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    return apiClient.put<User>(`/users/${id}`, userData);
  },

  // DELETE /users/:id - Delete user
  deleteUser: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/users/${id}`);
  },
};

export default usersApi;
