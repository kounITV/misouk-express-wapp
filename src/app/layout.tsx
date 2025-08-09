"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider, Toaster } from "@/components/ui";
import { Noto_Sans_Lao } from "next/font/google";
import "./globals.css";

const notoSansLao = Noto_Sans_Lao({
  subsets: ['lao'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lo">
      <body className={notoSansLao.className}>
        <SessionProvider>
          <ToastProvider>
            <Toaster />
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}