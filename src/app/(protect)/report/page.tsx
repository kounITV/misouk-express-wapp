"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Calendar, BarChart3, TrendingUp, Users, Package, Search, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import Image from "next/image";
import { AuthService } from "@/lib/auth-service";
import { useAuth } from "@/lib/hooks/use-auth";
import { LogoutButton } from "@/components/ui/logout-button";
import { SidebarMenu } from "@/components/ui/sidebar-menu";
import { cn } from "@/lib/utils";
import { apiEndpoints } from "@/lib/config";
import { Product, PaginationData } from "@/types/product";
import { formatDate } from "@/lib/utils/product";

const getRoleName = (role: any): string => {
  const roleName = typeof role === 'string' ? role : (role?.name || role?.id || '');

  switch (roleName) {
    case 'super_admin': return 'ຊູບເປີແອັດມິນ';
    case 'thai_admin': return 'ແອັດມິນສາຂາໄທ';
    case 'lao_admin': return 'ແອັດມິນສາຂາລາວ';
    default: return String(roleName || '');
  }
};


const getStatusDisplay = (status: string): string => {
  switch (status) {
    case 'AT_THAI_BRANCH':
      return 'ສິນຄ້າຮອດໄທ';
    case 'EXIT_THAI_BRANCH':
      return 'ສິນຄ້າອອກຈາກໄທ';
    case 'AT_LAO_BRANCH':
      return 'ສິນຄ້າຮອດລາວ';
    case 'COMPLETED':
      return 'ລູກຄ້າຮັບເອົາສິນຄ້າ';
    default:
      return status;
  }
};

const getCurrencyDisplay = (currency: string | null): string => {
  switch (currency) {
    case 'LAK':
      return 'ກີບ';
    case 'THB':
      return 'ບາດ';
    default:
      return currency || '';
  }
};

const getPaymentDisplay = (isPaid: boolean): string => {
  return isPaid ? 'ຊຳລະແລ້ວ' : 'ຍັງບໍ່ຊຳລະ';
};

export default function ReportPage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Summary card dates (default to today)
  const [summaryStartDate, setSummaryStartDate] = useState<string>(today || '');
  const [summaryEndDate, setSummaryEndDate] = useState<string>(today || '');
  
  // Orders filter dates (default to empty)
  const [ordersStartDate, setOrdersStartDate] = useState<string>('');
  const [ordersEndDate, setOrdersEndDate] = useState<string>('');
  
  const [reportData, setReportData] = useState({
    totalPaidLak: 0,
    totalUnpaidLak: 0,
    totalPaidThb: 0,
    totalUnpaidThb: 0,
    totalOrders: 0
  });

  const [orders, setOrders] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    per_page: 50,
    current_page: 1,
    total_pages: 1,
    next_page: null,
    prev_page: null,
  });

  const { user: currentUser, isMounted } = useAuth();

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOrders(page, itemsPerPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    fetchOrders(1, newItemsPerPage);
  };

  // Fetch report summary data from API
  const fetchReportSummary = async (start: string, end: string) => {
    try {
      setSummaryLoading(true);
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");
      
      const url = `${apiEndpoints.reportSummary}?start_date=${start}&end_date=${end}`;
      console.log('Fetching report summary from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Fetch report summary failed: ${response.status}`, errorText);
        throw new Error(`Fetch report summary failed: ${response.status} - ${errorText.substring(0, 100)}`);
      }
      
      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 200));
      
      // Check if response is HTML (DOCTYPE)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('Received HTML instead of JSON:', responseText.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Check API endpoint and authentication.');
      }
      
      const result = JSON.parse(responseText);
      console.log('Report summary parsed:', result);
      
      if (result.success && result.data) {
        const { total_summary } = result.data;
        setReportData({
          totalPaidLak: total_summary.total_paid_lak || 0,
          totalUnpaidLak: total_summary.total_unpaid_lak || 0,
          totalPaidThb: total_summary.total_paid_thb || 0,
          totalUnpaidThb: total_summary.total_unpaid_thb || 0,
          totalOrders: total_summary.total_orders || 0
        });
      }
    } catch (error) {
      console.error('Error fetching report summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Fetch orders data for the table
  const fetchOrders = async (page: number = 1, limit: number = 50) => {
    try {
      setOrdersLoading(true);
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");
      
      let url = `${apiEndpoints.orders}?page=${page}&limit=${limit}`;
      
      // Add search and filter parameters only if they are set
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      if (selectedStatus) {
        url += `&status=${encodeURIComponent(selectedStatus)}`;
      }
      if (selectedCurrency) {
        url += `&currency=${encodeURIComponent(selectedCurrency)}`;
      }
      if (selectedPayment) {
        const isPaid = selectedPayment === 'paid';
        url += `&is_paid=${isPaid}`;
      }
      // Don't include date filters by default - only when explicitly searching
      
      console.log('Fetching orders from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      console.log('Orders response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Fetch orders failed: ${response.status}`, errorText);
        throw new Error(`Fetch orders failed: ${response.status} - ${errorText.substring(0, 100)}`);
      }
      
      const responseText = await response.text();
      console.log('Orders raw response:', responseText.substring(0, 200));
      
      // Check if response is HTML (DOCTYPE)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('Received HTML instead of JSON:', responseText.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Check API endpoint and authentication.');
      }
      
      const result = JSON.parse(responseText);
      console.log('Orders parsed:', result);
      
      if (result.success) {
        const ordersData = result.data || [];
        setOrders(ordersData);
        
        if (result.pagination) {
          setPagination({
            total: result.pagination.total_records || 0,
            per_page: limit,
            current_page: result.pagination.current_page || page,
            total_pages: result.pagination.total_pages || 1,
            next_page: result.pagination.next_page || null,
            prev_page: result.pagination.prev_page || null,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch summary data when component mounts or summary dates change
  useEffect(() => {
    if (summaryStartDate && summaryEndDate) {
      fetchReportSummary(summaryStartDate, summaryEndDate);
    }
  }, [summaryStartDate, summaryEndDate]);

  // Fetch all orders when component mounts (without date filtering)
  useEffect(() => {
    fetchOrders(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);


  const handleLogout = () => {
    AuthService.clearAuth();
    AuthService.redirectToHome();
  };

  const handleExportReport = async () => {
    try {
      setOrdersLoading(true);
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");
      
      let url = `${apiEndpoints.orders}/export/excel`;
      const params = new URLSearchParams();
      
      // Add search and filter parameters (same as fetchOrdersWithDateFilter)
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (selectedStatus) {
        params.append('status', selectedStatus);
      }
      if (selectedCurrency) {
        params.append('currency', selectedCurrency);
      }
      if (selectedPayment) {
        const isPaid = selectedPayment === 'paid';
        params.append('is_paid', isPaid.toString());
      }
      // Include date filters when exporting (use orders dates)
      if (ordersStartDate) {
        params.append('start_date', ordersStartDate);
      }
      if (ordersEndDate) {
        params.append('end_date', ordersEndDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('Exporting orders from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      console.log('Export response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Export failed: ${response.status}`, errorText);
        
        // Handle specific error messages
        if (response.status === 403) {
          alert('ບໍ່ມີສິດເຂົ້າເຖິງການສົ່ງອອກຂໍ້ມູນ - ສະເພາະ Super Admin ເທົ່ານັ້ນ');
        } else {
          alert(`ຜິດພາດໃນການສົ່ງອອກ: ${response.status}`);
        }
        return;
      }
      
      // Get the file blob
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Generate filename with current date and filters
      const today = new Date().toISOString().split('T')[0];
      let filename = `orders_export_${today}`;
      
      if (ordersStartDate && ordersEndDate) {
        filename += `_${ordersStartDate}_to_${ordersEndDate}`;
      } else if (ordersStartDate) {
        filename += `_from_${ordersStartDate}`;
      } else if (ordersEndDate) {
        filename += `_until_${ordersEndDate}`;
      }
      
      if (selectedStatus) {
        filename += `_${selectedStatus}`;
      }
      
      filename += '.xlsx';
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('ຜິດພາດໃນການດາວໂຫຼດລາຍງານ');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchOrdersWithDateFilter = async (page: number = 1, limit: number = 50) => {
    try {
      setOrdersLoading(true);
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");
      
      let url = `${apiEndpoints.orders}?page=${page}&limit=${limit}`;
      
      // Add search and filter parameters
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      if (selectedStatus) {
        url += `&status=${encodeURIComponent(selectedStatus)}`;
      }
      if (selectedCurrency) {
        url += `&currency=${encodeURIComponent(selectedCurrency)}`;
      }
      if (selectedPayment) {
        const isPaid = selectedPayment === 'paid';
        url += `&is_paid=${isPaid}`;
      }
      // Include date filters when searching (only if orders dates are set)
      if (ordersStartDate) {
        url += `&start_date=${ordersStartDate}`;
      }
      if (ordersEndDate) {
        url += `&end_date=${ordersEndDate}`;
      }
      
      console.log('Fetching orders with date filter from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      console.log('Orders response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Fetch orders failed: ${response.status}`, errorText);
        throw new Error(`Fetch orders failed: ${response.status} - ${errorText.substring(0, 100)}`);
      }
      
      const responseText = await response.text();
      console.log('Orders raw response:', responseText.substring(0, 200));
      
      // Check if response is HTML (DOCTYPE)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('Received HTML instead of JSON:', responseText.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Check API endpoint and authentication.');
      }
      
      const result = JSON.parse(responseText);
      console.log('Orders parsed:', result);
      
      if (result.success) {
        const ordersData = result.data || [];
        setOrders(ordersData);
        
        if (result.pagination) {
          setPagination({
            total: result.pagination.total_records || 0,
            per_page: limit,
            current_page: result.pagination.current_page || page,
            total_pages: result.pagination.total_pages || 1,
            next_page: result.pagination.next_page || null,
            prev_page: result.pagination.prev_page || null,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSearch = () => {
    // Reset to first page and fetch with current filters including date
    setCurrentPage(1);
    fetchOrdersWithDateFilter(1, itemsPerPage);
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
        <main className="flex-1 p-6 bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Page Title and Date Filter */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">
                ລາຍງານ
              </h1>
              <div className="flex items-end gap-4">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">ວັນທີເລີ່ມຕົ້ນ (ສະຫຼຸບ)</label>
                    <input 
                      type="date" 
                      value={summaryStartDate}
                      onChange={(e) => setSummaryStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[120px] placeholder-[#818A91] text-black"
                    />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">ວັນທີສິ້ນສຸດ (ສະຫຼຸບ)</label>
                  <input 
                    type="date" 
                    value={summaryEndDate}
                    onChange={(e) => setSummaryEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[120px] placeholder-[#818A91] text-black"
                  />
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Total Paid Items (LAK) */}
              <Card className="border-2" style={{ backgroundColor: '#006939', borderColor: '#006939' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white mb-2">ຍອດລວມລາຍການສິນຄ້າທີຊໍາລະແລ້ວ (ກີບ)</p>
                      <div className="flex items-center">
                        <span className="text-3xl font-bold text-white mr-2">K</span>
                        <span className="text-3xl font-bold text-white">
                          {summaryLoading ? '...' : reportData.totalPaidLak.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Paid Items (THB) */}
              <Card className="border-2" style={{ backgroundColor: '#006939', borderColor: '#006939' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white mb-2">ຍອດລວມລາຍການສິນຄ້າທີຊໍາລະແລ້ວ (ບາດ)</p>
                      <div className="flex items-center">
                        <span className="text-3xl font-bold text-white mr-2">฿</span>
                        <span className="text-3xl font-bold text-white">
                          {summaryLoading ? '...' : reportData.totalPaidThb.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Unpaid Items (LAK) */}
              <Card className="border-2" style={{ backgroundColor: '#952626', borderColor: '#952626' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white mb-2">ຍອດລວມລາຍການສິນຄ້າທີ່ຍັງບໍ່ຊໍາລະ (ກີບ)</p>
                      <div className="flex items-center">
                        <span className="text-3xl font-bold text-white mr-2">K</span>
                        <span className="text-3xl font-bold text-white">
                          {summaryLoading ? '...' : reportData.totalUnpaidLak.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Unpaid Items (THB) */}
              <Card className="border-2" style={{ backgroundColor: '#952626', borderColor: '#952626' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white mb-2">ຍອດລວມລາຍການສິນຄ້າທີ່ຍັງບໍ່ຊໍາລະ (ບາດ)</p>
                      <div className="flex items-center">
                        <span className="text-3xl font-bold text-white mr-2">฿</span>
                        <span className="text-3xl font-bold text-white">
                          {summaryLoading ? '...' : reportData.totalUnpaidThb.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-black">ລາຍງານສິນຄ້າ</h2>
                <Button 
                  onClick={handleExportReport}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={ordersLoading}
                >
                  {ordersLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ກຳລັງດາວໂຫຼດ...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      ດາວໂຫລດ
                    </>
                  )}
                </Button>
                    </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap items-end gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="ຄົ້ນຫາ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm placeholder-[#818A91] text-black"
                    />
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[140px] text-black"
                  >
                    <option value="">ສະຖານະ</option>
                    <option value="AT_THAI_BRANCH">ສິນຄ້າຮອດໄທ</option>
                    <option value="EXIT_THAI_BRANCH">ສິນຄ້າອອກຈາກໄທ</option>
                    {currentUser?.role !== 'thai_admin' && (
                      <>
                        <option value="AT_LAO_BRANCH">ສິນຄ້າຮອດລາວ</option>
                        <option value="COMPLETED">ລູກຄ້າຮັບເອົາສິນຄ້າ</option>
                      </>
                    )}
                  </select>

                  {/* Currency Dropdown */}
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[100px] text-black"
                  >
                    <option value="">ສະກຸນເງິນ</option>
                    <option value="LAK">ກີບ</option>
                    <option value="THB">ບາດ</option>
                  </select>

                  {/* Payment Dropdown */}
                  <select
                    value={selectedPayment}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[120px] text-black"
                  >
                    <option value="">ການຊຳລະ</option>
                    <option value="paid">ຊຳລະແລ້ວ</option>
                    <option value="unpaid">ຍັງບໍ່ຊຳລະ</option>
                  </select>

                  {/* Start Date Picker */}
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">ວັນທີເລີ່ມຕົ້ນ</label>
                    <input
                      type="date"
                      value={ordersStartDate}
                      onChange={(e) => setOrdersStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[120px] placeholder-[#818A91] text-black"
                    />
                  </div>

                  {/* End Date Picker */}
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">ວັນທີສິ້ນສຸດ</label>
                    <input
                      type="date"
                      value={ordersEndDate}
                      onChange={(e) => setOrdersEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[120px] placeholder-[#818A91] text-black"
                    />
                  </div>

                  {/* Search Button */}
                  <Button
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm whitespace-nowrap"
                  >
                    ຄົ້ນຫາ
                  </Button>
                    </div>
                  </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-16">ລຳດັບ</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[120px]">ຊື່ລູກຄ້າ</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[140px]">ລະຫັດ</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[100px] hidden sm:table-cell">ເບີໂທ</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[80px]">ລາຄາ</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-16 hidden md:table-cell">ສະກຸນ</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[120px]">ສະຖານະ</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[100px]">ການຊຳລະ</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[100px] hidden lg:table-cell">ວັນທີອອກໃບບິນ</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[100px] hidden xl:table-cell">ວັນທີແກ້ໄຂ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ordersLoading ? (
                      <tr>
                        <td colSpan={10} className="px-2 md:px-4 py-8 text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                          </div>
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-2 md:px-4 py-8 text-center text-gray-500">
                          ບໍ່ມີຂໍ້ມູນ
                        </td>
                      </tr>
                    ) : (
                      orders.map((order, index) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          {/* ລຳດັບ */}
                          <td className="px-2 md:px-4 py-3 text-sm text-gray-900 text-center">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          {/* ຊື່ລູກຄ້າ */}
                          <td className="px-2 md:px-4 py-3 text-sm text-gray-900">
                            <div className="max-w-[120px] truncate" title={order.client_name}>
                              {order.client_name}
                            </div>
                          </td>
                          {/* ລະຫັດ */}
                          <td className="px-2 md:px-4 py-3 text-sm text-blue-600 font-medium">
                            <div className="max-w-[140px] truncate" title={order.tracking_number}>
                              {order.tracking_number}
                            </div>
                          </td>
                          {/* ເບີໂທ - Hidden on mobile */}
                          <td className="px-2 md:px-4 py-3 text-sm text-gray-900 hidden sm:table-cell">
                            <div className="max-w-[100px] truncate">
                              {order.client_phone || '-'}
                            </div>
                          </td>
                          {/* ລາຄາ */}
                          <td className="px-2 md:px-4 py-3 text-sm text-gray-900">
                            <div className="text-right">
                              {order.amount ? order.amount.toLocaleString() : '-'}
                            </div>
                            {/* Show currency on mobile when currency column is hidden */}
                            <div className="text-xs text-gray-500 md:hidden">
                              {getCurrencyDisplay(order.currency)}
                            </div>
                          </td>
                          {/* ສະກຸນເງິນ - Hidden on mobile/tablet */}
                          <td className="px-2 md:px-4 py-3 text-sm text-gray-900 hidden md:table-cell text-center">
                            {getCurrencyDisplay(order.currency)}
                          </td>
                          {/* ສະຖານະ */}
                          <td className="px-2 md:px-4 py-3 text-sm text-gray-900">
                            <div className="max-w-[120px]">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'AT_THAI_BRANCH' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'EXIT_THAI_BRANCH' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'AT_LAO_BRANCH' ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {getStatusDisplay(order.status)}
                              </span>
                            </div>
                          </td>
                          {/* ການຊຳລະ */}
                          <td className="px-2 md:px-4 py-3 text-sm">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                              order.is_paid 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {getPaymentDisplay(order.is_paid)}
                            </span>
                          </td>
                          {/* ວັນທີອອກໃບບິນ - Hidden on small screens */}
                          <td className="px-2 md:px-4 py-3 text-sm text-gray-900 hidden lg:table-cell">
                            <div className="text-xs">
                              {formatDate(order.created_at)}
                            </div>
                          </td>
                          {/* ວັນທີແກ້ໄຂ - Hidden on smaller screens */}
                          <td className="px-2 md:px-4 py-3 text-sm text-gray-900 hidden xl:table-cell">
                            <div className="text-xs">
                              {formatDate(order.updated_at || order.created_at)}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                totalRecords={pagination.total}
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                nextPage={pagination.next_page}
                prevPage={pagination.prev_page}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
