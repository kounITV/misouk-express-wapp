"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package, CheckCircle, XCircle, Clock, Home, Truck } from "lucide-react";
import Image from "next/image";
import { AuthService } from "@/lib/auth-service";
import { useAuth } from "@/lib/hooks/use-auth";
import { LogoutButton } from "@/components/ui/logout-button";
import { SidebarMenu } from "@/components/ui/sidebar-menu";
import { apiEndpoints } from "@/lib/config";

interface ProductData {
  id: string;
  tracking_number: string;
  client_name: string;
  client_phone: string | null;
  amount: number | null;
  currency: string | null;
  status: string;
  is_paid: boolean;
  remark: string | null;
  created_at: string;
  updated_at: string;
}

export default function DataCheckPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<ProductData[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const { user: currentUser, isMounted } = useAuth();

  // Handle URL parameters on component mount
  useEffect(() => {
    const trackingParam = searchParams.get('tracking');
    if (trackingParam) {
      setSearchTerm(trackingParam);
      handleSearch(trackingParam);
    }
  }, [searchParams]);

  const handleLogout = () => {
    AuthService.clearAuth();
    AuthService.redirectToHome();
  };

  const handleSearch = async (searchValue?: string) => {
    const query = searchValue || searchTerm.trim();
    if (!query) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const token = AuthService.getStoredToken();
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${apiEndpoints.orders}/tracking/${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSearchResults(Array.isArray(result.data) ? result.data : [result.data]);
        } else {
          setSearchResults([]);
        }
      } else {
        console.error('Search failed:', response.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'AT_THAI_BRANCH': return 'ສິນຄ້າຮອດໄທ';
      case 'EXIT_THAI_BRANCH': return 'ສິນຄ້າອອກຈາກໄທ';
      case 'AT_LAO_BRANCH': return 'ສິນຄ້າຮອດລາວ';
      case 'COMPLETED': return 'ລູກຄ້າຮັບເອົາສິນຄ້າ';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'AT_LAO_BRANCH': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'EXIT_THAI_BRANCH': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'AT_THAI_BRANCH': return <Clock className="w-5 h-5 text-orange-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const formatTimeOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const getDeliverySteps = (status: string, createdAt: string, updatedAt: string) => {
    const steps = [
      {
        id: '1',
        title: 'ສິນຄ້າຮອດໄທ',
        subtitle: 'ສາງໄທ',
        date: formatDateOnly(createdAt),
        time: formatTimeOnly(createdAt),
        completed: false,
        icon: 'home'
      },
      {
        id: '2',
        title: 'ສິນຄ້າອອກຈາກໄທ',
        subtitle: 'ສິນຄ້າເດີນທາງມາລາວ',
        date: formatDateOnly(createdAt),
        time: formatTimeOnly(createdAt),
        completed: false,
        icon: 'truck'
      },
      {
        id: '3',
        title: 'ສິນຄ້າຮອດລາວ',
        subtitle: 'ສາງລາວ',
        date: formatDateOnly(createdAt),
        time: formatTimeOnly(createdAt),
        completed: false,
        icon: 'home'
      },
      {
        id: '4',
        title: 'ລູກຄ້າຮັບເອົາສິນຄ້າ',
        subtitle: '',
        date: formatDateOnly(createdAt),
        time: formatTimeOnly(createdAt),
        completed: false,
        icon: 'check'
      }
    ];

    // Mark completed steps based on current status
    const statusOrder = ['AT_THAI_BRANCH', 'EXIT_THAI_BRANCH', 'AT_LAO_BRANCH', 'COMPLETED'];
    const currentIndex = statusOrder.indexOf(status);

    steps.forEach((step, index) => {
      if (index <= currentIndex) {
        step.completed = true;
      }
    });

    return steps;
  };

  const getIcon = (iconType: string, completed: boolean) => {
    const iconClass = `w-6 h-6 ${completed ? "text-white" : "text-gray-400"}`

    switch (iconType) {
      case "home":
        return <Home className={iconClass} />
      case "truck":
        return <Truck className={iconClass} />
      case "check":
        return <CheckCircle className={iconClass} />
      default:
        return <CheckCircle className={iconClass} />
    }
  };

  const getRoleName = (role: any): string => {
    const roleName = typeof role === 'string' ? role : (role?.name || role?.id || '');
    
    switch (roleName) {
      case 'super_admin': return 'ຊູບເປີແອັດມິນ';
      case 'thai_admin': return 'ແອັດມິນສາຂາໄທ';
      case 'lao_admin': return 'ແອັດມິນສາຂາລາວ';
      case 'normal_user': return 'ແອັດມິນທົ່ວໄປ';
      default: return String(roleName || '');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Responsive Sidebar */}
      <SidebarMenu
        currentUserRole={currentUser?.role ? (typeof currentUser.role === 'string' ? currentUser.role : currentUser.role.name) : 'super_admin'}
        currentPath="/data-check"
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
      <div className="flex-1 flex flex-col transition-all duration-300 ml-0 lg:ml-0">
        {/* Header */}
        <header className="bg-[#0c64b0] text-white px-4 md:px-6 py-4 flex justify-between lg:justify-end items-center">
          {/* Mobile Menu Button - Hide when menu is open */}
          <div className={`lg:hidden ${isMobileMenuOpen ? 'hidden' : 'block'}`}>
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

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">ໜ້າກວດສອບຂໍ້ມູນ</h1>
              <p className="text-gray-600 mt-2">ກວດສອບແລະຊອກຫາຂໍ້ມູນສິນຄ້າ</p>
            </div>

            {/* Search Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-800">ຊອກຫາຂໍ້ມູນ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="ປ້ອນລະຫັດສິນຄ້າ ຫຼື ຊື່ລູກຄ້າ"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 placeholder-[#888888] border-black focus:border-black focus:ring-black text-black"
                      />
                    </div>
                  </div>
                  <Button 
                    className="bg-[#0c64b0] hover:bg-[#0a5496] text-white"
                    onClick={() => handleSearch()}
                    disabled={isSearching || !searchTerm.trim()}
                  >
                    {isSearching ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    {isSearching ? 'ກຳລັງຊອກຫາ...' : 'ຊອກຫາ'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-800">
                  ຜົນການຊອກຫາ
                  {hasSearched && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({searchResults.length} ລາຍການ)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasSearched ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">ຍັງບໍ່ມີຂໍ້ມູນ</p>
                    <p className="text-gray-400 text-sm mt-2">ກະລຸນາປ້ອນຂໍ້ມູນເພື່ອຊອກຫາ</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">ບໍ່ພົບຂໍ້ມູນ</p>
                    <p className="text-gray-400 text-sm mt-2">ລະຫັດສິນຄ້າທີ່ຊອກຫາບໍ່ມີໃນລະບົບ</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {searchResults.map((product) => (
                      <div key={product.id} className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
                        {/* Customer Information Header */}
                        <div className="flex justify-between items-start mb-8">
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-600">ຊື່ລູກຄ້າ: </span>
                              <span className="text-blue-600 font-medium">{product.client_name}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">ເບີໂທລູກຄ້າ: </span>
                              <span className="text-gray-600">{product.client_phone || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">ລະຫັດສິນຄ້າ: </span>
                              <span className="text-blue-600 font-medium">{product.tracking_number}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">ສະຖານະ: </span>
                            <span className="text-blue-600 font-medium">{getStatusDisplay(product.status)}</span>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative">
                          {/* Vertical line */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform -translate-x-px"></div>

                          <div className="space-y-6">
                            {getDeliverySteps(product.status, product.created_at, product.updated_at).map((step, index) => (
                              <div key={step.id} className="relative grid grid-cols-3 items-start gap-4">
                                <div className="text-right text-sm text-gray-600">
                                  <div>{step.date}</div>
                                  <div>{step.time}</div>
                                </div>

                                <div className="flex justify-center">
                                  <div
                                    className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${
                                      step.completed ? "bg-green-500" : "bg-gray-300"
                                    }`}
                                  >
                                    {getIcon(step.icon, step.completed)}
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h3 className={`font-medium ${step.completed ? "text-green-600" : "text-gray-400"}`}>{step.title}</h3>
                                  {step.subtitle && <p className="text-sm text-gray-500 mt-1">{step.subtitle}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            {/* Amount */}
                            {product.amount && (
                              <div>
                                <span className="text-gray-600">ຈຳນວນເງິນ: </span>
                                <span className="text-gray-900">
                                  {product.amount.toLocaleString()} {product.currency === 'LAK' ? 'ກີບ' : product.currency === 'THB' ? 'ບາດ' : product.currency || ''}
                                </span>
                              </div>
                            )}
                            
                            {/* Payment Status */}
                            <div>
                              <span className="text-gray-600">ການຊຳລະ: </span>
                              <span className={`font-medium ${
                                product.is_paid ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {product.is_paid ? 'ຊຳລະແລ້ວ' : 'ຍັງບໍ່ຊຳລະ'}
                              </span>
                            </div>
                            
                            {/* Remark */}
                            {product.remark && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <span className="text-gray-600">ໝາຍເຫດ: </span>
                                <span className="text-gray-900">{product.remark}</span>
                              </div>
                            )}
                            
                            {/* Created Date */}
                            <div>
                              <span className="text-gray-600">ວັນທີສ້າງ: </span>
                              <span className="text-gray-900">{formatDate(product.created_at)}</span>
                            </div>
                            
                            {/* Updated Date */}
                            <div>
                              <span className="text-gray-600">ວັນທີແກ້ໄຂ: </span>
                              <span className="text-gray-900">{formatDate(product.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
