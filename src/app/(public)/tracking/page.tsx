"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react";
import Image from "next/image";
import { apiEndpoints } from "@/lib/config";

export default function TrackingPage() {
    const [trackingNumber, setTrackingNumber] = useState('');
    const router = useRouter();

    const handleSearch = () => {
        if (trackingNumber.trim()) {
            // Redirect to tracking details page with the tracking number
            router.push(`/tracking/${encodeURIComponent(trackingNumber.trim())}`);
        }
    };

    // Optional: You can also add a direct API call here if needed
    const handleDirectSearch = async () => {
        if (trackingNumber.trim()) {
            try {
                const response = await fetch(`${apiEndpoints.orders}/tracking?tracking_number=${encodeURIComponent(trackingNumber.trim())}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        // Redirect to tracking details page
                        router.push(`/tracking/${encodeURIComponent(trackingNumber.trim())}`);
                    } else {
                        // Handle no data found
                        console.log('No tracking data found');
                    }
                }
            } catch (error) {
                console.error('Search error:', error);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="bg-[#f8fafc] py-4 sm:py-8 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center bg-white rounded-lg shadow-lg border border-gray-200 py-8 sm:py-12">
                <h1 className="text-[#247dc9] text-xl sm:text-2xl font-semibold mb-8 sm:mb-12">Misouk Express Tracking</h1>

                <div className="flex flex-col sm:flex-row gap-4 mb-12 sm:mb-16">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#247DC9] w-4 h-4 sm:w-5 sm:h-5" />
                        <Input
                            type="text"
                            placeholder="ປ້ອນລະຫັດສິນຄ້າ"
                            className="h-10 sm:h-12 text-sm sm:text-base border-[#247DC9] focus:border-[#247DC9] focus:ring-[#247DC9] pl-9 sm:pl-10 text-[#247DC9]"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                    <Button 
                        className="bg-[#247dc9] hover:bg-[#0c64b0] text-[#ffffff] px-6 sm:px-8 h-10 sm:h-12 touch-button"
                        onClick={handleSearch}
                        disabled={!trackingNumber.trim()}
                    >
                        ຄົ້ນຫາ
                    </Button>
                </div>

                {/* Document and Person Illustration */}
                <div className="flex flex-col items-center mb-6 sm:mb-8">
                    <div className="relative w-60 sm:w-80 h-48 sm:h-64 flex items-center justify-center">
                        <Image 
                            src="/empty.png" 
                            alt="Empty" 
                            width={100} 
                            height={150} 
                            className="w-16 h-24 sm:w-20 sm:h-30"
                        />
                    </div>
                    
                    <p className="text-[#247dc9] text-base sm:text-lg font-medium">ຂໍ້ມູນວ່າງເປົ່າ</p>
                </div>
            </div>
        </div>
    );
}

