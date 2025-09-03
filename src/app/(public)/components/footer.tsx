import { Phone, Mail, MapPin, Facebook, MessageCircle } from "lucide-react";
import Image from "next/image";
import { memo } from "react";

// Contact information constants to avoid duplication
const CONTACT_INFO = {
  phone: "021 12345678",
  whatsapp: "020 12345678",
  email: "info@express.la",
  facebook: "MISOUK EXPRESS",
} as const;

const COMPANY_ADDRESS = [
  "ບ້ານ ໂພນຕ້ອງ",
  "ເມືອງ ຈັນທະບູລີ", 
  "ແຂວງ ນະຄອນຫຼວງວຽງຈັນ"
] as const;

interface ContactItemProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  label?: string;
}

const ContactItem = memo(({ icon: Icon, text, label }: ContactItemProps) => (
  <div className="flex items-center space-x-2">
    <Icon className="w-4 h-4 text-white flex-shrink-0" aria-hidden="true" />
    <span className="text-sm text-white" aria-label={label}>
      {text}
    </span>
  </div>
));

ContactItem.displayName = "ContactItem";

export const Footer = memo(() => {
  return (
    <footer className="bg-[#0C64B0] text-white py-8" role="contentinfo">
      <div className="max-w-6xl mx-auto px-6">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {/* Column 1: Logo and QR Code */}
          <div className="flex flex-col items-start space-y-4">
            <Image
              src="/logo-01.png"
              alt="MISOUK EXPRESS"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <div className="w-20 h-20 bg-white rounded p-1 ml-11">
              <Image
                src="/qr-code.png"
                alt="QR Code for quick access"
                width={64}
                height={64}
                className="w-full h-full rounded"
                loading="lazy"
              />
            </div>
          </div>

          {/* Column 2: Contact Us and Social Media */}
          <div>
            {/* Contact Us */}
            <section className="mb-6">
              <h3 className="font-semibold mb-4 text-white">ຕິດຕໍ່ພວກເຮົາ</h3>
              <div className="space-y-3">
                <ContactItem 
                  icon={Phone} 
                  text={CONTACT_INFO.phone}
                  label="Phone number"
                />
                <ContactItem 
                  icon={Mail} 
                  text={CONTACT_INFO.email}
                  label="Email address"
                />
              </div>
            </section>

            {/* Social Media */}
            <section>
              <h3 className="font-semibold mb-4 text-white">Social Media</h3>
              <div className="space-y-3">
                <ContactItem 
                  icon={Facebook} 
                  text={CONTACT_INFO.facebook}
                  label="Facebook page"
                />
                <ContactItem 
                  icon={MessageCircle} 
                  text={CONTACT_INFO.whatsapp}
                  label="WhatsApp number"
                />
              </div>
            </section>
          </div>

          {/* Column 3: Company Information and Address */}
          <div>
            {/* Company Information */}
            <section className="mb-6">
              <h3 className="font-semibold mb-4 text-white">ຂໍ້ມູນບໍລິສັດ</h3>
              <ContactItem 
                icon={Phone} 
                text={CONTACT_INFO.phone}
                label="Company phone"
              />
            </section>

            {/* Company Address */}
            <section>
              <h3 className="font-semibold mb-4 text-white">ທີ່ຕັ້ງບໍລິສັດ</h3>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-white" aria-hidden="true" />
                <address className="text-sm space-y-1 text-white not-italic">
                  {COMPANY_ADDRESS.map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </address>
              </div>
            </section>
          </div>
        </div>

        {/* Mobile Layout - 2 columns, 3 rows, 3 sections */}
        <div className="md:hidden">
          {/* Row 1 - Section 1: Logo centered with underline */}
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo-01.png"
                alt="MISOUK EXPRESS"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>
            <div className="border-b border-[#247dc9] mx-auto w-full"></div>
          </div>

          {/* Row 2 - Section 2: Contact Us and Company Address (2 columns) */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Column 1: Contact Us */}
            <div>
              <h3 className="font-semibold mb-3 text-white text-sm">ຕິດຕໍ່ພວກເຮົາ</h3>
              <div className="space-y-2">
                <ContactItem 
                  icon={Phone} 
                  text={CONTACT_INFO.phone}
                  label="Phone number"
                />
                <ContactItem 
                  icon={Mail} 
                  text={CONTACT_INFO.email}
                  label="Email address"
                />
              </div>
            </div>

            {/* Column 2: Company Address */}
            <div>
              <h3 className="font-semibold mb-3 text-white text-sm">ທີ່ຕັ້ງບໍລິສັດ</h3>
              <div className="flex items-start space-x-2">
                <MapPin className="w-3 h-3 mt-1 flex-shrink-0 text-white" aria-hidden="true" />
                <address className="text-xs space-y-1 text-white not-italic">
                  {COMPANY_ADDRESS.map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </address>
              </div>
            </div>
          </div>

          {/* Row 3 - Section 3: Social Media and QR Code (2 columns) */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Column 1: Social Media */}
            <div>
              <h3 className="font-semibold mb-3 text-white text-sm">Social Media</h3>
              <div className="space-y-2">
                <ContactItem 
                  icon={Facebook} 
                  text={CONTACT_INFO.facebook}
                  label="Facebook page"
                />
                <ContactItem 
                  icon={MessageCircle} 
                  text={CONTACT_INFO.whatsapp}
                  label="WhatsApp number"
                />
              </div>
            </div>

            {/* Column 2: QR Code */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-white rounded p-1">
                <Image
                  src="/qr-code.png"
                  alt="QR Code for quick access"
                  width={56}
                  height={56}
                  className="w-full h-full rounded"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#247dc9] mt-8 pt-6 text-center">
          <p className="text-sm text-white">
            © 2025, MISOUK EXPRESS, All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer"; 