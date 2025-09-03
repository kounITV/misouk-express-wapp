"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Calendar, BarChart3, TrendingUp, Users, Package } from "lucide-react";
import Image from "next/image";
import { AuthService } from "@/lib/auth-service";
import { useAuth } from "@/lib/hooks/use-auth";
import { LogoutButton } from "@/components/ui/logout-button";
import { SidebarMenu } from "@/components/ui/sidebar-menu";

const getRoleName = (role: any): string => {
  const roleName = typeof role === 'string' ? role : (role?.name || role?.id || '');

  switch (roleName) {
    case 'super_admin': return 'ຊູບເປີແອັດມິນ';
    case 'thai_admin': return 'ແອັດມິນສາຂາໄທ';
    case 'lao_admin': return 'ແອັດມິນສາຂາລາວ';
    default: return String(roleName || '');
  }
};

export default function ReportPage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    monthlyGrowth: 0
  });

  const { user: currentUser, isMounted } = useAuth();

  useEffect(() => {
    // Mock data - replace with actual API calls
    setReportData({
      totalOrders: 1245,
      totalUsers: 25,
      totalRevenue: 125000000,
      completedOrders: 987,
      pendingOrders: 258,
      monthlyGrowth: 12.5
    });
  }, []);

  const handleLogout = () => {
    AuthService.clearAuth();
    AuthService.redirectToHome();
  };

  const handleExportReport = (type: string) => {
    setLoading(true);
    // Mock export functionality
    setTimeout(() => {
      setLoading(false);
      alert(`ກຳລັງດາວໂຫຼດລາຍງານ ${type}...`);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('lo-LA', {
      style: 'currency',
      currency: 'LAK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Responsive Sidebar */}
      <SidebarMenu
        currentUserRole={currentUser?.role ? (typeof currentUser.role === 'string' ? currentUser.role : currentUser.role.name) : 'super_admin'}
        currentPath="/report"
        onMenuClick={(href) => {
          router.push(href);
        }}
        onCollapseChange={() => {
          // Handle sidebar collapse if needed
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        currentUser={currentUser}
        onLogout={handleLogout}
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
            {/* Page Title and Export Buttons */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                ລາຍງານລະບົບ
              </h1>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleExportReport('PDF')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  onClick={() => handleExportReport('Excel')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
              {/* Total Orders */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">ຄຳສັ່ງທັງໝົດ</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.totalOrders.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Users */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">ຜູ້ໃຊ້ລະບົບ</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Revenue */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">ລາຍຮັບທັງໝົດ</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalRevenue)}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Completed Orders */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">ຄຳສັ່ງສຳເລັດ</p>
                      <p className="text-2xl font-bold text-green-600">{reportData.completedOrders.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Orders */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">ຄຳສັ່ງລໍຖ້າ</p>
                      <p className="text-2xl font-bold text-orange-600">{reportData.pendingOrders.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Growth */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">ການເຕີບໂຕລາຍເດືອນ</p>
                      <p className="text-2xl font-bold text-blue-600">+{reportData.monthlyGrowth}%</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Orders Report */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b border-gray-200 p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg font-medium text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    ລາຍງານຄຳສັ່ງຊື້
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ຄຳສັ່ງທີ່ສຳເລັດແລ້ວ</span>
                      <span className="font-semibold text-green-600">{reportData.completedOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ຄຳສັ່ງກຳລັງດຳເນີນ</span>
                      <span className="font-semibold text-orange-600">{reportData.pendingOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ອັດຕາສຳເລັດ</span>
                      <span className="font-semibold text-blue-600">
                        {((reportData.completedOrders / reportData.totalOrders) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Report */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b border-gray-200 p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg font-medium text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    ລາຍງານການເງິນ
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ລາຍຮັບລວມ</span>
                      <span className="font-semibold text-green-600">{formatCurrency(reportData.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ລາຍຮັບສະເລ່ຍຕໍ່ຄຳສັ່ງ</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(reportData.totalRevenue / reportData.totalOrders)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ການເຕີບໂຕ</span>
                      <span className="font-semibold text-green-600">+{reportData.monthlyGrowth}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coming Soon Section */}
            <Card className="bg-white shadow-sm mt-6">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">ກຳລັງພັດທະນາ</h3>
                <p className="text-gray-600 mb-4">
                  ລາຍງານແບບລະອຽດ, ກຣາຟ, ແລະການວິເຄາະຂໍ້ມູນເພີ່ມເຕີມ ກຳລັງຢູ່ໃນຂັ້ນຕອນການພັດທະນາ
                </p>
                <div className="text-sm text-gray-500">
                  ຄາດວ່າຈະສຳເລັດໃນອີກບໍ່ດົນ...
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
