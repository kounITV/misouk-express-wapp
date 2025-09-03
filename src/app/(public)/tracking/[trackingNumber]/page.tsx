"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, ArrowLeft, Home, Truck, CheckCircle } from "lucide-react";
import { apiEndpoints } from "@/lib/config";

interface TrackingData {
  tracking_number: string;
  client_name: string;
  client_phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DeliveryStep {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  completed: boolean;
  icon: "home" | "truck" | "check";
}

const TrackingDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.trackingNumber) {
      const decodedTrackingNumber = decodeURIComponent(params.trackingNumber as string);
      setTrackingNumber(decodedTrackingNumber);
      fetchTrackingData(decodedTrackingNumber);
    }
  }, [params.trackingNumber]);

  const fetchTrackingData = async (number: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiEndpoints.orders}/tracking/${encodeURIComponent(number)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      console.log('Tracking API response status:', response.status);
      console.log('Tracking API URL:', `${apiEndpoints.orders}/tracking/${encodeURIComponent(number)}`);

      if (response.ok) {
        const result = await response.json();
        console.log('Tracking API result:', result);

        if (result.success && result.data) {
          setTrackingData(result.data);
        } else {
          setError('ບໍ່ພົບຂໍ້ມູນການຕິດຕາມສິນຄ້າ');
        }
      } else {
        const errorText = await response.text();
        console.error('Tracking API error:', response.status, errorText);
        setError('ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫາ');
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່');
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    if (trackingNumber.trim()) {
      router.push(`/tracking/${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNewSearch();
    }
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
  }

  const getDeliverySteps = (status: string, createdAt: string, updatedAt: string): DeliveryStep[] => {
    const steps: DeliveryStep[] = [
      {
        id: '1',
        title: 'ສິນຄ້າຮອດໄທ',
        subtitle: 'ສາງໄທ',
        date: formatDate(createdAt),
        time: formatTime(createdAt),
        completed: false,
        icon: 'home'
      },
      {
        id: '2',
        title: 'ສິນຄ້າອອກຈາກໄທ',
        subtitle: 'ສິນຄ້າເດີນທາງມາລາວ',
        date: formatDate(createdAt),
        time: formatTime(createdAt),
        completed: false,
        icon: 'truck'
      },
      {
        id: '3',
        title: 'ສິນຄ້າຮອດລາວ',
        subtitle: 'ສາງລາວ',
        date: formatDate(createdAt),
        time: formatTime(createdAt),
        completed: false,
        icon: 'home'
      },
      {
        id: '4',
        title: 'ລູກຄ້າຮັບສິນຄ້າ',
        subtitle: '',
        date: formatDate(createdAt),
        time: formatTime(createdAt),
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-[#f8fafc] py-8 min-h-screen ">
      <div className="max-w-6xl min-w-300sm mx-auto px-6">
        {/* Header with Search */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-[#247dc9] text-2xl font-semibold mb-4">
              Misouk Express Tracking
            </h1>

            {/* Search Bar */}
            <div className="flex gap-4 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#247DC9] w-5 h-5" />
                <Input
                  type="text"
                  placeholder="AGDYU6DTYF98"
                  className="h-12 text-base border-[#247DC9] focus:border-[#247DC9] focus:ring-[#247DC9] pl-10 text-[#247DC9]"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Button
                className="bg-[#247dc9] hover:bg-[#0c64b0] text-white px-6 h-12"
                onClick={handleNewSearch}
                disabled={!trackingNumber.trim() || loading}
              >
                ຄົ້ນຫາ
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">ກຳລັງຄົ້ນຫາ...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={() => router.push('/tracking')}
                variant="outline"
                className="border-[#247dc9] text-[#247dc9] hover:bg-[#247dc9] hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ກັບຄືນ
              </Button>
            </div>
          )}

                                 {/* Tracking Results */}
            {trackingData && !loading && !error && (
              <Card className="p-6 bg-white shadow-sm">
                {/* Customer Information */}
                <div className="mb-8 space-y-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <div className="mb-2">
                        <span className="text-gray-600 text-sm">ຊື່ລູກຄ້າ: </span>
                        <span className="text-blue-600 font-medium">{trackingData.client_name}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-gray-600 text-sm">ເບີໂທລູກຄ້າ: </span>
                        <span className="text-blue-600 font-medium">{trackingData.client_phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">ລະຫັດສິນຄ້າ: </span>
                        <span className="text-blue-600 font-medium">{trackingData.tracking_number}</span>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <span className="text-gray-600 text-sm">ສະຖານະ: </span>
                      <span className="text-blue-600 font-medium">ແຈ້ງລູກຄ້າຮັບເຄື່ອງ</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform -translate-x-px"></div>

                  <div className="space-y-6">
                    {getDeliverySteps(trackingData.status, trackingData.created_at, trackingData.updated_at).map((step, index) => (
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
              </Card>
            )}
        </div>

        {/* Back Button */}
        {trackingData && (
          <div className="text-center">
            <Button
              onClick={() => router.push('/tracking')}
              variant="outline"
              className="border-[#247dc9] text-[#247dc9] hover:bg-[#247dc9] hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ຄົ້ນຫາອື່ນ
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingDetailsPage;
