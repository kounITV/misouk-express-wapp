"use client";

import { Phone, Mail, MapPin, Facebook, MessageCircle } from "lucide-react";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="bg-[#0c64b0] text-[#ffffff] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and QR Code */}
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo-01.png"
                alt="MISOUK EXPRESS"
                width={100}
                height={35}
                className="h-8 w-auto"
              />
            </div>
            <div className="w-16 h-16 bg-[#ffffff] rounded p-1">
              <Image
                src="/empty.png"
                alt="QR Code"
                width={56}
                height={56}
                className="w-full h-full rounded"
              />
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-semibold mb-4">ຕິດຕໍ່ພວກເຮົາ</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">021 12345678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">info@express.la</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold mb-4">Social Media</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                <span className="text-sm">MISOUK EXPRESS</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">020 12345678</span>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div>
            <h3 className="font-semibold mb-4">ຂໍ້ມູນບໍລິສັດ</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">021 12345678</span>
              </div>
              <div>
                <div className="font-semibold text-sm mb-2">ທີ່ຕັ້ງບໍລິສັດ</div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <div className="text-sm space-y-1">
                    <div>ບ້ານ ໂພນຕ້ອງ</div>
                    <div>ເມືອງ ຈັນທະບູລີ</div>
                    <div>ແຂວງ ນະຄອນຫຼວງວຽງຈັນ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#247dc9] mt-8 pt-6 text-center">
          <p className="text-sm opacity-80">
            © 2025, MISOUK EXPRESS, All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}; 