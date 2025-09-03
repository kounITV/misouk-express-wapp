export interface User {
  id: string;
  username: string;
  lastname?: string;
  email: string;
  phone?: string;
  role: 'Super_Admin' | 'Laos' | 'Thai';
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  username: string;
  lastname?: string;
  email: string;
  phone?: string;
  password: string;
  role: 'Super_Admin' | 'Laos' | 'Thai';
  status: 'active' | 'inactive';
}

export interface UpdateUserRequest {
  username?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: 'Super_Admin' | 'Laos' | 'Thai';
  status?: 'active' | 'inactive';
}

export interface UserListResponse {
  data: User[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
