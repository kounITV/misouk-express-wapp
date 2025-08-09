"use client"

import React from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react";
import Image from "next/image";

export default function TrackingPage () {
    return (
        <div className="bg-[#f8fafc] min-h-screen">
            <main className="flex-1 py-30">
                <div className="max-w-6xl mx-auto px-6 text-center bg-white rounded-lg shadow-lg border border-gray-200 py-12">
                    <h1 className="text-[#247dc9] text-2xl font-semibold mb-12">Misouk Express Tracking</h1>

                    <div className="flex gap-4 mb-16">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#247DC9] w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="ປ້ອນລະຫັດສິນຄ້າ"
                                className="h-12 text-base border-[#247DC9] focus:border-[#247DC9] focus:ring-[#247DC9] pl-10 text-[#247DC9]"
                            />
                        </div>
                        <Button className="bg-[#247dc9] hover:bg-[#0c64b0] text-[#ffffff] px-8 h-12">ຄົ້ນຫາ</Button>
                    </div>

                    {/* Document and Person Illustration */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative w-80 h-64 flex items-center justify-center">
                            <Image src="/empty.png" alt="Empty" width={100} height={150} />
                            
                        </div>
                        
                        <p className="text-[#247dc9] text-lg font-medium">ຂໍ້ມູນວ່າງເປົ່າ</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

