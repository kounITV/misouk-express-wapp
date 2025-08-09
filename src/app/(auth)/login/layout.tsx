"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider, Toaster } from "@/components/ui";
import "src/app/globals.css";

// Create a client
const queryClient = new QueryClient();

// Layout Component
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
};

// Add Body as property of Layout
Layout.Body = ({ children }: { children: React.ReactNode }) => (
  <main className="flex-1">{children}</main>
);

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ToastProvider>
          <Toaster />
          <Layout>
            {children}
          </Layout>
        </ToastProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}