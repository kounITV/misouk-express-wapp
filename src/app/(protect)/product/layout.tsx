"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Loading } from "@/components/containers/loading";
import { ErrorBoundary } from "@/components/ui";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, token, isMounted, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    //console.log('Product AuthGuard - isMounted:', isMounted, 'isLoading:', isLoading, 'token:', token ? 'Present' : 'Missing', 'user:', user ? 'Present' : 'Missing');
    
    if (isMounted && !isLoading && (!token || !user)) {
      //console.log('Product AuthGuard - No auth data, redirecting to home');
      router.push("/");
    }
  }, [token, user, isMounted, isLoading, router]);

  if (!isMounted || isLoading) {
    return <Loading variant="progress" />;
  }

  if (!token || !user) {
    //console.log('Product AuthGuard - No auth data, showing loading while redirecting');
    return <Loading variant="progress" />;
  }

  console.log('Product AuthGuard - Auth verified, rendering children');
  return <>{children}</>;
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <AuthGuard>
        {children}
      </AuthGuard>
    </ErrorBoundary>
  );
}
