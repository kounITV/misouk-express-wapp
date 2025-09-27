"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock } from "lucide-react";
import { AuthService } from "@/lib/auth-service";

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: "ກະລຸນາໃສ່ຊື່ຜູ້ໃຊ້ຂອງທ່ານ" }),
  password: z
    .string()
    .min(1, { message: "ກະລຸນາໃສ່ລະຫັດຜ່ານຂອງທ່ານ" }),
  rememberMe: z.boolean()
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: true,
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
      
      if (result && result.success && result.data) {
        console.log('Login successful - storing auth data');
        console.log('Token:', result.data.token);
        console.log('User:', result.data.user);
        
        // Store authentication data with remember me option
        AuthService.storeAuth(result.data.token, result.data.user, data.rememberMe);
        
        // Verify storage worked
        const storedToken = AuthService.getStoredToken();
        const storedUser = AuthService.getStoredUser();
        console.log('Verification - Token stored:', storedToken ? 'Yes' : 'No');
        console.log('Verification - User stored:', storedUser ? 'Yes' : 'No');
        
        // Use Next.js router for navigation instead of window.location
        const userRole = (result.data.user as any)?.role || 'super_admin';
        const redirectPath = (userRole === 'super_admin' || userRole === 'normal_user') ? '/data-check' : '/user';
        console.log('Redirecting to:', redirectPath);
        
        // Use router.push for better navigation
        setTimeout(() => {
          router.push(redirectPath);
        }, 100);
      } else if (result && result.data && result.data.token) {
        console.log('Login successful (alternative structure) - storing auth data');
        
        // Alternative API structure with remember me option
        AuthService.storeAuth(result.data.token, result.data.user || { username: data.username }, data.rememberMe);
        
        // Use Next.js router for navigation
        const userRole = (result.data.user as any)?.role || 'super_admin';
        const redirectPath = (userRole === 'super_admin' || userRole === 'normal_user') ? '/data-check' : '/user';
        console.log('Redirecting to:', redirectPath);
        
        setTimeout(() => {
          router.push(redirectPath);
        }, 100);
      } else {
        // Login failed
        form.setError("root", { 
          type: "manual", 
          message: result?.message || "ການເຂົ້າສູ່ລະບົບລົ້ມເຫລວ" 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      form.setError("root", { 
        type: "manual", 
        message: error instanceof Error ? error.message : "ຊື່ບັນຊີ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">ເຂົ້າສູ່ລະບົບ</CardTitle>
        <CardDescription className="text-center">
          ປ້ອນຊື່ຜູ້ໃຊ້ແລະລະຫັດຜ່ານຂອງທ່ານ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">ຊື່ຜູ້ໃຊ້</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="username"
                type="text"
                placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
                className="pl-10"
                {...form.register("username")}
              />
            </div>
            {form.formState.errors.username && (
              <p className="text-red-500 text-sm">{form.formState.errors.username.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">ລະຫັດຜ່ານ</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="password"
                type="password"
                placeholder="ປ້ອນລະຫັດຜ່ານ"
                className="pl-10"
                {...form.register("password")}
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="rememberMe"
              type="checkbox"
              className="rounded border-gray-300 text-[#075FAB] focus:ring-[#075FAB]"
              {...form.register("rememberMe")}
            />
            <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
              ຈື່ການເຂົ້າສູ່ລະບົບ (ເພື່ອບໍ່ໃຫ້ອອກຈາກລະບົບເມື່ອປິດບາວເຊີ)
            </Label>
          </div>

          {form.formState.errors.root && (
            <p className="text-red-500 text-sm text-center">{form.formState.errors.root.message}</p>
          )}

          <Button 
            type="submit" 
            className="w-full bg-[#0c64b0] hover:bg-[#247dc9]" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ກຳລັງເຂົ້າສູ່ລະບົບ...
              </div>
            ) : (
              "ເຂົ້າສູ່ລະບົບ"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
