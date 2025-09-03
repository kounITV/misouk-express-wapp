"use client";

import { ToastProvider, Toaster } from "@/components/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { Appbar } from "./components/appbar";
import { Footer } from "./components/footer";
import "src/app/globals.css";

// Layout Component
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Appbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Add Header and Footer as properties of Layout
Layout.Header = Appbar;
Layout.Body = ({ children }: { children: React.ReactNode }) => (
  <main className="flex-1">{children}</main>
);
Layout.Footer = Footer;

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance only once per layout mount
  const queryClient = useMemo(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Toaster />
        <Layout>
          {children}
        </Layout>
      </ToastProvider>
    </QueryClientProvider>
  );
}