"use client";

import { Phone, Mail, MapPin, Facebook, MessageCircle } from "lucide-react";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="bg-[#0C64B0] text-white py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo and QR Code */}
          <div className="flex flex-col items-start space-y-4">
            <Image
              src="/logo-01.png"
              alt="MISOUK EXPRESS"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
            <div className="w-20 h-20 bg-white rounded p-0 ml-11">
              <Image
                src="/qr-code.png"
                alt="QR Code"
                width={64}
                height={64}
                className="w-full h-full rounded"
              />
            </div>
          </div>

          {/* Column 2: Contact Us and Social Media */}
          <div>
            {/* Contact Us */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-white">ຕິດຕໍ່ພວກເຮົາ</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-white" />
                  <span className="text-sm text-white">021 12345678</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-white" />
                  <span className="text-sm text-white">info@express.la</span>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Social Media</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Facebook className="w-4 h-4 text-white" />
                  <span className="text-sm text-white">MISOUK EXPRESS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span className="text-sm text-white">020 12345678</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Company Information and Address */}
          <div>
            {/* Company Information */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-white">ຂໍ້ມູນບໍລິສັດ</h3>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-white" />
                <span className="text-sm text-white">021 12345678</span>
              </div>
            </div>

            {/* Company Address */}
            <div>
              <h3 className="font-semibold mb-4 text-white">ທີ່ຕັ້ງບໍລິສັດ</h3>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-white" />
                <div className="text-sm space-y-1 text-white">
                  <div>ບ້ານ ໂພນຕ້ອງ</div>
                  <div>ເມືອງ ຈັນທະບູລີ</div>
                  <div>ແຂວງ ນະຄອນຫຼວງວຽງຈັນ</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#247dc9] mt-8 pt-6 text-center">
          <p className="text-sm text-white">
            2025, MISOUK EXPRESS, All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}; 