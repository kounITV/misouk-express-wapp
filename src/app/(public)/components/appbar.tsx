"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LoginPopup } from "@/components/containers/login-popup";

export const Appbar = () => {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="bg-[#0c64b0] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-01.png"
              alt="MISOUK EXPRESS"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <Button
            variant="outline"
            className="bg-[#0c64b0] border-[#ffffff] text-[#ffffff] hover:bg-[#ffffff] hover:text-[#0c64b0]"
            onClick={() => setLoginOpen(true)}
          >
            ເຂົ້າສູ່ລະບົບ
          </Button>
        </div>
      </header>
      <LoginPopup open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}; 