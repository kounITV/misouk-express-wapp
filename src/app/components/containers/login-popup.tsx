"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Lock, X } from "lucide-react";
import { AuthService } from "@/lib/auth-service";

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: "ກະລຸນາໃສ່ຊື່ຜູ້ໃຊ້ຂອງທ່ານ" }),
  password: z
    .string()
    .min(1, { message: "ກະລຸນາໃສ່ລະຫັດຜ່ານຂອງທ່ານ" })
    // .min(8, { message: "ລະຫັດຜ່ານຕ້ອງຍາວຢ່າງນ້ອຍ 8 ຕົວອັກສອນ" }),
});

interface LoginPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginPopup({ open, onOpenChange }: LoginPopupProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await AuthService.login({
        username: data.username,
        password: data.password,
      });
      
      console.log('Login result:', result);
      
      // Check if result has the expected API structure
      if (result && result.success && result.data) {
        // Store authentication data
        AuthService.storeAuth(result.data.token, result.data.user);
        
        // Close dialog on successful login
        onOpenChange(false);
        
        // Redirect to user management page
        AuthService.redirectToUserManagement();
      } else if (result && result.data && result.data.token) {
        // Alternative API structure - direct token/user
        AuthService.storeAuth(result.data.token, result.data.user || { username: data.username });
        
        // Close dialog on successful login
        onOpenChange(false);
        
        // Redirect to user management page
        AuthService.redirectToUserManagement();
      } else {
        // Login failed - show error and keep dialog open
        form.setError("root", { 
          type: "manual", 
          message: result?.message || "ການເຂົ້າສູ່ລະບົບລົ້ມເຫລວ" 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      // Login failed - show error and keep dialog open
      form.setError("root", { 
        type: "manual", 
        message: error instanceof Error ? error.message : "ຊື່ບັນຊີ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
        <DialogHeader className="relative">
          <DialogTitle className="text-center text-xl font-semibold text-gray-800 mb-6">
            ເຂົ້າສູ່ລະບົບ
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-0 top-0 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </DialogHeader>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              ໄອດີຜູ້ໃຊ້
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#5B5B5B]" />
              <Input
                id="username"
                type="text"
                placeholder="ປ້ອນຂໍ້ມູນຂອງທ່ານ.."
                {...form.register("username")}
                className="h-12 pl-10 border-[#5B5B5B] focus:border-[#5B5B5B] focus:ring-[#5B5B5B] text-[#5B5B5B]"
              />
            </div>
            {form.formState.errors.username && (
              <p className="text-red-600 text-sm">{form.formState.errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              ລະຫັດຜ່ານ
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#5B5B5B]" />
              <Input
                id="password"
                type="password"
                placeholder="ປ້ອນລະຫັດຜ່ານ.."
                {...form.register("password")}
                className="h-12 pl-10 border-[#5B5B5B] focus:border-[#5B5B5B] focus:ring-[#5B5B5B] text-[#5B5B5B]"
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-red-600 text-sm">{form.formState.errors.password.message}</p>
            )}
          </div>

          {form.formState.errors.root && (
            <p className="text-red-600 text-sm text-center">{form.formState.errors.root.message}</p>
          )}

          <Button 
            type="submit" 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-lg font-medium"
            disabled={isLoading}
          >
            {isLoading ? "ກຳລັງເຂົ້າສູ່ລະບົບ..." : "ເຂົ້າສູ່ລະບົບ"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 