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
    if (isMounted && !isLoading && (!token || !user)) {
      router.push("/");
    }
  }, [token, user, isMounted, isLoading, router]);

  if (!isMounted || isLoading) {
    return <Loading variant="progress" />;
  }

  if (!token || !user) {
    return <Loading variant="progress" />;
  }

  return <>{children}</>;
}

export default function DataCheckLayout({
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
