"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings, Package, Plus } from "lucide-react";
import Image from "next/image";
import { AuthService } from "@/lib/auth-service";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ActionsDropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/label";
import { LogoutButton } from "@/components/ui/logout-button";
import { Pagination } from "@/components/ui/pagination";
import { SidebarMenu } from "@/components/ui/sidebar-menu";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { apiEndpoints } from "@/lib/config";

interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  gender: string;
  phone: string;
  role: string;
}

interface ApiUser {
  id?: string;
  _id?: string;
  username?: string;
  firstname?: string; 
  firstName?: string;
  lastname?: string;
  lastName?: string;
  gender?: string;
  phone?: string;
  role?: { name?: string } | string;
}

interface ApiRole { 
  id?: string; 
  _id?: string; 
  name: string;
}

interface RoleResponse {
  success?: boolean;
  data?: ApiRole[];
}

const getRoleName = (role: any): string => {
  // Safely extract role name if it's an object
  const roleName = typeof role === 'string' ? role : (role?.name || role?.id || '');
  
  switch (roleName) {
    case 'super_admin': return 'ຊູບເປີແອັດມິນ';
    case 'thai_admin': return 'ແອັດມິນສາຂາໄທ';
    case 'lao_admin': return 'ແອັດມິນສາຂາລາວ';
    case 'normal_user': return 'ແອັດມິນທົ່ວໄປ';
    default: return String(roleName || '');
  }
};

interface PaginationData {
  total_records: number;
  current_page: number;
  total_pages: number;
  next_page: number | null;
  prev_page: number | null;
}

interface PagedResponse<T> {
  // Variant A: { result, meta }
  result?: T[];
  meta?: {
    currentPage?: number;
    nextPage?: number | null;
    isLastPage?: boolean;
    pageCount?: number | null;
  };
  // Variant B (your API): { success, data, pagination }
  success?: boolean;
  data?: T[];
  pagination?: PaginationData;
}

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [pagination, setPagination] = useState<PaginationData>({
    total_records: 0,
    current_page: 1,
    total_pages: 1,
    next_page: null,
    prev_page: null,
  });
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstname: "",
    lastname: "",
    gender: "male" as "male" | "female",
    phone: "",
    role_id: "",
  });
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [usernameExists, setUsernameExists] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const { user: currentUser, isMounted } = useAuth();

  const isFormValid = useMemo(() => {
    const requiredFilled =
      form.username.trim() &&
      form.firstname.trim() &&
      form.lastname.trim() &&
      form.gender &&
      form.phone.trim() &&
      form.role_id.trim();
    
    // Check if username exists (for create mode or when changing username in edit mode)
    const usernameValid = !usernameExists || (editingUser && form.username === editingUser.username);
    
    // For create mode, password is required
    if (!editingUser) {
      return Boolean(
        requiredFilled && 
        usernameValid &&
        form.password.trim() && 
        form.confirmPassword.trim() && 
        form.password === form.confirmPassword
      );
    }
    
    // For edit mode, password is optional
    if (form.password || form.confirmPassword) {
      return Boolean(requiredFilled && usernameValid && form.password === form.confirmPassword);
    }
    
    return Boolean(requiredFilled && usernameValid);
  }, [form, editingUser, usernameExists]);

  const fetchUsers = async (page: number = 1, limit: number = 50) => {
    setLoading(true);
    try {
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");
      
      const url = `${apiEndpoints.users}?page=${page}&limit=${limit}`;
      console.log('Fetching users from:', url);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Fetch users failed: ${res.status}`, errorText);
        throw new Error(`Fetch users failed: ${res.status} - ${errorText.substring(0, 100)}`);
      }
      
      const responseText = await res.text();
      console.log('Raw response:', responseText.substring(0, 200));
      
      // Check if response is HTML (DOCTYPE)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('Received HTML instead of JSON:', responseText.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Check API endpoint and authentication.');
      }
      
      const data: PagedResponse<ApiUser> = JSON.parse(responseText);
      console.log(`GET /users page ${page} parsed:`, data);
      
      const incoming = (data.data ?? data.result ?? []) as ApiUser[];
      const normalized: User[] = incoming.map((u) => ({
        id: u.id ?? u._id ?? crypto.randomUUID(),
        username: u.username ?? "",
        firstname: u.firstname ?? u.firstName ?? "",
        lastname: u.lastname ?? u.lastName ?? "",
        gender: u.gender ?? "other",
        phone: u.phone ?? "",
        role: typeof u.role === 'string' ? u.role : (u.role?.name ?? ""),
      }));
      
      console.log("GET /users normalized:", normalized);
      setUsers(normalized);
      
      // Update pagination state
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = AuthService.getStoredToken();
      if (!token) return;
      
      console.log('Fetching roles from:', apiEndpoints.roles);
      
      const res = await fetch(apiEndpoints.roles, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      console.log('Roles response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Fetch roles failed: ${res.status}`, errorText);
        return;
      }
      
      const responseText = await res.text();
      console.log('Roles raw response:', responseText.substring(0, 200));
      
      // Check if response is HTML
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('Received HTML instead of JSON for roles:', responseText.substring(0, 200));
        return;
      }
      
      const response: RoleResponse = JSON.parse(responseText);
      console.log('GET /roles parsed:', response);
      const list: ApiRole[] = response.data ?? [];
      setRoles(list.map((r) => ({ id: r.id ?? r._id ?? "", name: r.name })));
    } catch (e) {
      console.error('Error fetching roles:', e);
    }
  };

  const fetchSingleUser = async (userId: string): Promise<User | null> => {
    try {
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");
      
      const res = await fetch(`${apiEndpoints.users}/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!res.ok) {
        throw new Error(`Fetch user failed: ${res.status}`);
      }
      
      const data = await res.json();
      const userData = data.data || data;
      
      return {
        id: userData.id || userData._id || "",
        username: userData.username || "",
        firstname: userData.firstname || userData.firstName || "",
        lastname: userData.lastname || userData.lastName || "",
        gender: userData.gender || "male",
        phone: userData.phone || "",
        role: typeof userData.role === 'string' ? userData.role : (userData.role?.name || ""),
      };
    } catch (e) {
      console.error('Error fetching user:', e);
      return null;
    }
  };

  const handleCreate = async () => {
    if (!isFormValid) return;
    setCreating(true);
    try {
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");
      const payload = {
        username: form.username,
        password: form.password,
        firstname: form.firstname,
        lastname: form.lastname,
        gender: form.gender,
        phone: form.phone,
        role_id: form.role_id,
      };
      const res = await fetch(apiEndpoints.users, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Create failed ${res.status}: ${errBody}`);
      }
      setOpenCreate(false);
      setEditingUser(null);
      // reset form
      setForm({ username: "", password: "", confirmPassword: "", firstname: "", lastname: "", gender: "male", phone: "", role_id: "" });
      await fetchUsers(pagination.current_page, itemsPerPage);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async () => {
    if (!isFormValid || !editingUser) return;
    setCreating(true);
    try {
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");
      
      const payload: any = {
        username: form.username,
        firstname: form.firstname,
        lastname: form.lastname,
        gender: form.gender,
        phone: form.phone,
        role_id: form.role_id,
      };
      
      // Only include password if it's provided
      if (form.password.trim()) {
        payload.password = form.password;
      }
      
      const res = await fetch(`${apiEndpoints.users}/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Update failed ${res.status}: ${errBody}`);
      }
      
      setOpenCreate(false);
      setEditingUser(null);
      // reset form
      setForm({ username: "", password: "", confirmPassword: "", firstname: "", lastname: "", gender: "male", phone: "", role_id: "" });
      await fetchUsers(pagination.current_page, itemsPerPage);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (user: User) => {
    setDeleting(true);
    try {
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");
      
      const res = await fetch(`${apiEndpoints.users}/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Delete failed ${res.status}: ${errBody}`);
      }
      
      setUserToDelete(null);
      await fetchUsers(pagination.current_page, itemsPerPage);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
      // Check if username exists in current users list (simple check)
      const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      return !!existingUser;
    } catch (e) {
      console.error('Error checking username:', e);
      return false;
    }
  };

  const openEditDialog = async (user: User) => {
    setLoadingEditId(user.id);
    try {
      const userData = await fetchSingleUser(user.id);
      if (userData) {
        setEditingUser(userData);
        setUsernameExists(false); // Reset username validation
        // Find the role_id for this user
        const userRole = roles.find(role => getRoleName(role.name) === getRoleName(userData.role));
        setForm({
          username: userData.username,
          password: "",
          confirmPassword: "",
          firstname: userData.firstname,
          lastname: userData.lastname,
          gender: (userData.gender as "male" | "female") || "male",
          phone: userData.phone,
          role_id: userRole?.id || "",
        });
        setOpenCreate(true);
      }
    } catch (e) {
      console.error('Error opening edit dialog:', e);
    } finally {
      setLoadingEditId(null);
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
  };

  const handleUsernameChange = async (username: string) => {
    setForm({ ...form, username });
    
    // Check username availability with debounce
    if (username.trim() && (!editingUser || username !== editingUser.username)) {
      const exists = await checkUsernameExists(username);
      setUsernameExists(exists);
    } else {
      setUsernameExists(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, itemsPerPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    // Reset to page 1 when changing items per page
    fetchUsers(1, newItemsPerPage);
  };

  useEffect(() => {
    console.log('=== User Management Page Mounted ===');
    console.log('API Base URL:', 'https://misouk-api.jackkaphon.com/api/v1');
    console.log('Users endpoint:', `https://misouk-api.jackkaphon.com/api/v1/users`);
    console.log('Roles endpoint:', `https://misouk-api.jackkaphon.com/api/v1/roles`);
    
    const token = AuthService.getStoredToken();
    console.log('Token available:', !!token);
    if (token) {
      console.log('Token preview:', token.substring(0, 20) + '...');
    }
    
    fetchUsers();
    fetchRoles();
  }, []);

  const handleLogout = () => {
    AuthService.clearAuth();
    AuthService.redirectToHome();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Responsive Sidebar */}
      <SidebarMenu
        currentUserRole={currentUser?.role ? (typeof currentUser.role === 'string' ? currentUser.role : currentUser.role.name) : 'super_admin'}
        currentPath="/user"
        onMenuClick={(href) => {
          router.push(href);
        }}
        onCollapseChange={() => {
          // Handle sidebar collapse if needed
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isMobileMenuOpen ? 'lg:ml-0 ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-[#0c64b0] text-white px-4 md:px-6 py-4 flex justify-between lg:justify-end items-center">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button 
              className="text-white p-2" 
              aria-label="Menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Desktop Logo - Positioned absolutely, only visible on large screens */}
          <Image src="/logo-01.png" alt="MISOUK EXPRESS" width={120} height={40} className="hidden lg:block h-8 w-auto absolute left-20" />
          
          {/* User info and logout - Only visible on large screens (desktop) */}
          <div className="hidden lg:flex items-center gap-2 md:gap-4">
            <div className="text-white text-xs md:text-sm">
              <div className="font-medium">{isMounted && currentUser ? currentUser.username : 'Super Admin'}</div>
              {isMounted && currentUser && currentUser.role && (
                <div className="text-xs text-blue-200">{getRoleName(currentUser.role)}</div>
              )}
            </div>
            <LogoutButton onLogout={handleLogout} className="text-white" />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Title and Add Button */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">ຈັດການຜູ້ນຳໃຊ້ລະບົບ</h1>
              <Button className="bg-[#0c64b0] hover:bg-[#247dc9] text-white" onClick={() => setOpenCreate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                ເພີ່ມຜູ້ໃຊ້
              </Button>
            </div>

            {/* User Table */}
            <Card className="bg-white shadow-sm">
              {/* <CardHeader className="border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium text-gray-800">ລາຍການຜູ້ໃຊ້ງານ</CardTitle>
                  {loading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      ກຳລັງໂຫຼດ...
                    </div>
                  )}
                  {!loading && users.length > 0 && (
                    <div className="text-sm text-gray-500 bg-green-100 px-3 py-1 rounded">
                      ທັງໝົດ {users.length} ຄົນ
                    </div>
                  )}
                </div>
              </CardHeader> */}
              <CardContent className="p-6">
                <div className="overflow-x-auto relative">
                   <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          ລຳດັບ
                        </th>
                         <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                           ຊື່ຜູ້ໃຊ້
                         </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          ຊື່
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          ນາມສະກຸນ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          ເພດ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          ເບີໂທ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          ສິດການນຳໃຊ້
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          ຈັດການ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading && (
                        <tr>
                          <td className="px-6 py-12 text-center" colSpan={8}>
                            <div className="flex flex-col items-center justify-center space-y-4">
                              <div className="relative">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                              </div>
                              <div className="text-sm text-gray-600">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {!loading && users.length === 0 && (
                        <tr>
                          <td className="px-6 py-12 text-center" colSpan={8}>
                            <div className="flex flex-col items-center justify-center space-y-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-400" />
                              </div>
                              <div className="text-sm text-gray-500">ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້</div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {!loading && users.map((user, index) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.firstname}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.lastname}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.gender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getRoleName(user.role)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {loadingEditId === user.id ? (
                              <div className="flex justify-center">
                                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                              </div>
                            ) : (
                              <ActionsDropdown
                                onEdit={() => openEditDialog(user)}
                                onDelete={() => openDeleteDialog(user)}
                                align="end"
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <Pagination
                totalRecords={pagination.total_records}
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                nextPage={pagination.next_page}
                prevPage={pagination.prev_page}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </Card>
            <Dialog
              open={openCreate}
              onOpenChange={(open) => {
                setOpenCreate(open);
                if (!open) {
                  setForm({ username: "", password: "", confirmPassword: "", firstname: "", lastname: "", gender: "male", phone: "", role_id: "" });
                  setEditingUser(null);
                }
              }}
            >
              <DialogContent className="max-w-sm w-full mx-4 max-h-[90vh] bg-white flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle className="text-black font-bold text-left">
                    {editingUser ? 'ແກ້ໄຂຜູ້ໃຊ້' : 'ເພີ່ມຜູ້ໃຊ້'}
                  </DialogTitle>
                </DialogHeader>
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-1">
                  {/* General Info */}
                  <div className="bg-gray-100 px-3 py-2 rounded text-sm text-gray-700">ຂໍ້ມູນທົ່ວໄປ</div>
                  <div className="grid grid-cols-1 gap-4 mt-3">
                  <div>
                    <Label className="mb-1 block text-black">ເພດ</Label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="gender" value="male" checked={form.gender === 'male'} onChange={() => setForm({ ...form, gender: 'male' })} className="accent-[#2E72D2]" /> ຊາຍ
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="gender" value="female" checked={form.gender === 'female'} onChange={() => setForm({ ...form, gender: 'female' })} className="accent-[#2E72D2]" /> ຍິງ
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="firstname" className="text-black">ຊື່</Label>
                    <Input id="firstname" placeholder="ປ້ອນຊື່.." value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })} className="text-black placeholder:text-[#818A91] focus:ring-[#2E72D2] focus:border-[#2E72D2] border-gray-300" />
                  </div>
                  <div>
                    <Label htmlFor="lastname" className="text-black">ນາມສະກຸນ</Label>
                    <Input id="lastname" placeholder="ປ້ອນນາມສະກຸນ.." value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} className="text-black placeholder:text-[#818A91] focus:ring-[#2E72D2] focus:border-[#2E72D2] border-gray-300" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-black">ເບີໂທ</Label>
                    <Input id="phone" placeholder="ປ້ອນເບີໂທ.." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="text-black placeholder:text-[#818A91] focus:ring-[#2E72D2] focus:border-[#2E72D2] border-gray-300" />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-black">ສິດການນຳໃຊ້</Label>
                    <select
                      id="role"
                      className="mt-2 block w-full border border-gray-300 rounded-md p-2 text-black focus:ring-[#2E72D2] focus:border-[#2E72D2] focus:outline-none"
                      value={form.role_id}
                      onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                    >
                      <option value="">ເລືອກສິດ</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{getRoleName(r.name)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Account Info */}
                <div className="bg-gray-100 px-3 py-2 rounded text-sm text-gray-700 mt-4">ບັນຊີເຂົ້າລະບົບ</div>
                <div className="grid grid-cols-1 gap-4 mt-3">
                  <div>
                    <Label htmlFor="username" className="text-black">ຊື່ຜູ້ໃຊ້</Label>
                    <Input 
                      id="username" 
                      placeholder={usernameExists ? "ຊື່ຜູ້ໃຊ້ນີ້ມີຢູ່ແລ້ວ" : "ປ້ອນຊື່ຜູ້ໃຊ້.."} 
                      value={form.username} 
                      onChange={(e) => handleUsernameChange(e.target.value)} 
                      className={`text-black placeholder:text-[#818A91] focus:ring-[#2E72D2] focus:border-[#2E72D2] ${
                        usernameExists 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500 placeholder:text-red-400' 
                          : 'border-gray-300'
                      }`} 
                    />
                    {usernameExists && (
                      <p className="text-red-500 text-xs mt-1">ຊື່ຜູ້ໃຊ້ນີ້ມີຢູ່ແລ້ວ</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-black">ລະຫັດ</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="ປ້ອນລະຫັດ.." 
                      value={form.password} 
                      onChange={(e) => setForm({ ...form, password: e.target.value })} 
                      className="text-black placeholder:text-[#818A91] focus:ring-[#2E72D2] focus:border-[#2E72D2] border-gray-300" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm" className="text-black">ຢືນຢັນລະຫັດ</Label>
                    <Input 
                      id="confirm" 
                      type="password" 
                      placeholder="ປ້ອນລະຫັດຜ່ານຜູ້ໃຊ້.." 
                      value={form.confirmPassword} 
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} 
                      className="text-black placeholder:text-[#818A91] focus:ring-[#2E72D2] focus:border-[#2E72D2] border-gray-300" 
                    />
                  </div>
                  </div>
                </div>
                <DialogFooter className="flex-shrink-0 flex justify-center gap-4 pt-6 border-t border-gray-200 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setOpenCreate(false)}
                    className="bg-[#F6FAFF] text-[#247DC9] border-[#247DC9] hover:bg-[#E8F4FF] px-8"
                  >
                    ຍົກເລີກ
                  </Button>
                  <Button 
                    disabled={!isFormValid || creating} 
                    onClick={editingUser ? handleEdit : handleCreate}
                    className={`px-8 text-white border-none ${
                      isFormValid && !creating 
                        ? 'bg-[#075FAB] hover:bg-[#064a95]' 
                        : 'bg-[#BDD5EB] hover:bg-[#BDD5EB] cursor-not-allowed'
                    }`}
                  >
                    {creating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {editingUser ? 'ກຳລັງແກ້ໄຂ...' : 'ກຳລັງບັນທຶກ...'}
                      </div>
                    ) : (
                      editingUser ? 'ແກ້ໄຂ' : 'ບັນທຶກ'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={!!userToDelete}
              onOpenChange={(open) => {
                if (!open) setUserToDelete(null);
              }}
              onConfirm={() => {
                if (userToDelete) {
                  handleDelete(userToDelete);
                }
              }}
              title="ທ່ານຕ້ອງການລຶບລາຍການນີ້ແທ້ ຫຼື ບໍ່ ?"
              loading={deleting}
            />
          </div>
        </main>
      </div>
    </div>
  );
}