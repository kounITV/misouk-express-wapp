"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userData: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  user?: User | null;
  loading?: boolean;
  mode: 'create' | 'edit';
}

export const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  user,
  loading = false,
  mode
}) => {
  const [formData, setFormData] = useState({
    username: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    role: 'Laos' as 'Super_Admin' | 'Laos' | 'Thai',
    status: 'active' as 'active' | 'inactive'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        username: user.username || '',
        lastname: user.lastname || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '', // Don't pre-fill password for security
        role: user.role,
        status: user.status
      });
    } else {
      // Reset form for create mode
      setFormData({
        username: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
        role: 'Laos',
        status: 'active'
      });
    }
    setErrors({});
  }, [mode, user, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'ຊື່ຜູ້ໃຊ້ແມ່ນຈຳເປັນ';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'ອີເມວແມ່ນຈຳເປັນ';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ';
    }

    if (mode === 'create' && !formData.password.trim()) {
      newErrors.password = 'ລະຫັດຜ່ານແມ່ນຈຳເປັນ';
    }

    if (mode === 'edit' && formData.password && formData.password.length < 6) {
      newErrors.password = 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ';
    }

    if (mode === 'create' && formData.password && formData.password.length < 6) {
      newErrors.password = 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        const createData: CreateUserRequest = {
          username: formData.username.trim(),
          lastname: formData.lastname.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          password: formData.password,
          role: formData.role,
          status: formData.status
        };
        await onSubmit(createData);
      } else {
        const updateData: UpdateUserRequest = {
          username: formData.username.trim(),
          lastname: formData.lastname.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role,
          status: formData.status
        };
        
        // Only include password if it's provided
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        
        await onSubmit(updateData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const roleOptions = [
    { value: 'Super_Admin', label: 'Super Admin' },
    { value: 'Laos', label: 'Laos' },
    { value: 'Thai', label: 'Thai' }
  ];

  const statusOptions = [
    { value: 'active', label: 'ເປີດໃຊ້ງານ' },
    { value: 'inactive', label: 'ປິດໃຊ້ງານ' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full mx-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'ເພີ່ມຜູ້ໃຊ້ງານ' : 'ແກ້ໄຂຜູ້ໃຊ້ງານ'}
          </DialogTitle>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              ຊື່ຜູ້ໃຊ້ *
            </Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`mt-1 ${errors.username ? 'border-red-500' : ''}`}
              placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
              disabled={loading}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastname" className="text-sm font-medium text-gray-700">
              ນາມສະກຸນ
            </Label>
            <Input
              id="lastname"
              type="text"
              value={formData.lastname}
              onChange={(e) => handleInputChange('lastname', e.target.value)}
              className="mt-1"
              placeholder="ປ້ອນນາມສະກຸນ"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              ອີເມວ *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
              placeholder="ປ້ອນອີເມວ"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              ເບີໂທລະສັບ
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="mt-1"
              placeholder="ປ້ອນເບີໂທລະສັບ"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              ລະຫັດຜ່ານ {mode === 'create' ? '*' : '(ເວົ້າຫວ່າງໄວ້ຫາກບໍ່ຕ້ອງການປ່ຽນ)'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`mt-1 ${errors.password ? 'border-red-500' : ''}`}
              placeholder={mode === 'create' ? 'ປ້ອນລະຫັດຜ່ານ' : 'ປ້ອນລະຫັດຜ່ານໃໝ່'}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
              ບົດບາດ
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
              disabled={loading}
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              ສະຖານະ
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value as 'active' | 'inactive')}
              disabled={loading}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="mt-2 sm:mt-0"
            >
              ຍົກເລີກ
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#247DC9] text-white hover:bg-[#1e6bb8]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{mode === 'create' ? 'ກຳລັງເພີ່ມ...' : 'ກຳລັງອັບເດດ...'}</span>
                </div>
              ) : (
                mode === 'create' ? 'ເພີ່ມ' : 'ອັບເດດ'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
