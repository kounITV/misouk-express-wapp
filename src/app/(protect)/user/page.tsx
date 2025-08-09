"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings, Package, LogOut, Plus, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
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

const getRoleName = (role: string): string => {
  switch (role) {
    case 'super_admin': return 'ຊູບເປີແອັດມິນ';
    case 'thai_admin': return 'ແອັດມິນສາຂາໄທ';
    case 'lao_admin': return 'ແອັດມິນສາຂາລາວ';
    default: return role;
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
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

  const { user: currentUser, isMounted } = useAuth();

  const isFormValid = useMemo(() => {
    const requiredFilled =
      form.username.trim() &&
      form.password.trim() &&
      form.confirmPassword.trim() &&
      form.firstname.trim() &&
      form.lastname.trim() &&
      form.gender &&
      form.phone.trim() &&
      form.role_id.trim();
    return Boolean(requiredFilled && form.password === form.confirmPassword);
  }, [form]);

  const fetchUsers = async (page: number = 1, limit: number = 50) => {
    setLoading(true);
    try {
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");
      
      const url = `${apiEndpoints.users}?page=${page}&limit=${limit}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!res.ok) {
        throw new Error(`Fetch users failed: ${res.status}`);
      }
      
      const data: PagedResponse<ApiUser> = await res.json();
      console.log(`GET /users page ${page} raw:`, data);
      
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
      const res = await fetch(apiEndpoints.roles, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });
      if (res.ok) {
        const response: RoleResponse = await res.json();
        console.log('GET /roles raw:', response);
        const list: ApiRole[] = response.data ?? [];
        setRoles(list.map((r) => ({ id: r.id ?? r._id ?? "", name: r.name })));
      }
    } catch (e) {
      console.error(e);
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
      // reset form
      setForm({ username: "", password: "", confirmPassword: "", firstname: "", lastname: "", gender: "male", phone: "", role_id: "" });
      await fetchUsers(pagination.current_page, itemsPerPage);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
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
    fetchUsers();
    fetchRoles();
  }, []);

  const handleLogout = () => {
    AuthService.clearAuth();
    AuthService.redirectToHome();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-16 bg-[#0c64b0] flex flex-col items-center py-6 space-y-6">
        {/* Logo */}
        <div className="text-white">
          <Image src="/logo-01.png" alt="MISOUK" width={32} height={32} className="w-8 h-8" />
        </div>
        
        {/* Navigation Icons */}
        <div className="flex flex-col space-y-4">
          <div className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded cursor-pointer">
            <Package className="w-6 h-6" />
          </div>
          <div className="p-2 text-white bg-white/20 rounded cursor-pointer">
            <Users className="w-6 h-6" />
          </div>
          <div className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded cursor-pointer">
            <Settings className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#0c64b0] text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/logo-01.png" alt="MISOUK EXPRESS" width={120} height={40} className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{isMounted && currentUser ? currentUser.username : 'Super Admin'}</span>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-transparent border-white text-white hover:bg-white hover:text-[#0c64b0]"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              ອອກຈາກລະບົບ
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Title and Add Button */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">ຈັດການຜູ້ມີໃຫ້ລະບົບ</h1>
              <Button className="bg-[#0c64b0] hover:bg-[#247dc9] text-white" onClick={() => setOpenCreate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                ເພີ່ມຜູ້ໃຊ້
              </Button>
            </div>

            {/* User Table */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium text-gray-800">ລາຍການຜູ້ໃຊ້ງານ</CardTitle>
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                    {loading ? 'ກຳລັງໂຫຼດ...' : 'ສິດຕາມສາຂາ'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                   <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ລຳດັບ
                        </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           ຊື່ຜູ້ໃຊ້
                         </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ຊື່
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ນາມສະກຸນ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ເພດ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ເບີໂທ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ສິດຕາມສາຂາ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ຈັດການ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.length === 0 && !loading && (
                        <tr>
                          <td className="px-6 py-6 text-center text-sm text-gray-500" colSpan={7}>ບໍ່ພົບຂໍ້ມູນ</td>
                        </tr>
                      )}
                      {users.map((user, index) => (
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  ແກ້ໄຂ
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  ລຶບ
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                }
              }}
            >
              <DialogContent className="max-w-lg bg-white">
                <DialogHeader>
                  <DialogTitle>ເພີ່ມຜູ້ໃຊ້</DialogTitle>
                  <DialogDescription>ກະລຸນາຕື່ມຂໍ້ມູນທີ່ຈຳເປັນ</DialogDescription>
                </DialogHeader>
                {/* General Info */}
                <div className="bg-gray-100 px-3 py-2 rounded text-sm text-gray-700">ຂໍ້ມູນທົ່ວໄປ</div>
                <div className="grid grid-cols-1 gap-4 mt-3">
                  <div>
                    <Label className="mb-1 block text-black">ເພດ</Label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="gender" value="male" checked={form.gender === 'male'} onChange={() => setForm({ ...form, gender: 'male' })} /> ຊາຍ
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="gender" value="female" checked={form.gender === 'female'} onChange={() => setForm({ ...form, gender: 'female' })} /> ຍິງ
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="firstname" className="text-black">ຊື່</Label>
                    <Input id="firstname" placeholder="ປ້ອນຊື່.." value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })} className="text-black placeholder:text-gray-500" />
                  </div>
                  <div>
                    <Label htmlFor="lastname" className="text-black">ນາມສະກຸນ</Label>
                    <Input id="lastname" placeholder="ປ້ອນນາມສະກຸນ.." value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} className="text-black placeholder:text-gray-500" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-black">ເບີໂທ</Label>
                    <Input id="phone" placeholder="ປ້ອນເບີໂທ.." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="text-black placeholder:text-gray-500" />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-black">ສິດຕາມສາຂາ</Label>
                    <select
                      id="role"
                      className="mt-2 block w-full border rounded-md p-2 text-black"
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
                    <Input id="username" placeholder="ປ້ອນຊື່ຜູ້ໃຊ້.." value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="text-black placeholder:text-gray-500" />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-black">ລະຫັດ</Label>
                    <Input id="password" type="password" placeholder="ປ້ອນລະຫັດ.." value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="text-black placeholder:text-gray-500" />
                  </div>
                  <div>
                    <Label htmlFor="confirm" className="text-black">ຢືນຢັນລະຫັດ</Label>
                    <Input id="confirm" type="password" placeholder="ຢືນຢັນລະຫັດ.." value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="text-black placeholder:text-gray-500" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenCreate(false)}>ຍົກເລີກ</Button>
                  <Button disabled={!isFormValid || creating} onClick={handleCreate}>ບັນທຶກ</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}