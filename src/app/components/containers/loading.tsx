"use client";

import React, { memo, useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "skeleton" | "progress";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const SIZE_CLASSES = {
  xs: "w-3 h-3",
  sm: "w-4 h-4", 
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
} as const;

const Spinner = memo(({ size, className }: { size: keyof typeof SIZE_CLASSES; className?: string }) => (
  <div
    className={cn(
      "animate-spin rounded-full border-2 border-gray-300 border-t-[#0c64b0]",
      SIZE_CLASSES[size],
      className
    )}
    role="status"
    aria-label="Loading"
  />
));

Spinner.displayName = "Spinner";

const Dots = memo(({ size, className }: { size: keyof typeof SIZE_CLASSES; className?: string }) => {
  const dotSize = size === "xs" ? "w-1 h-1" : size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
  
  return (
    <div className={cn("flex space-x-1", className)} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-[#0c64b0] rounded-full animate-pulse",
            dotSize
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  );
});

Dots.displayName = "Dots";

const ProgressLoader = memo(({ className }: { className?: string }) => {
  const [progress, setProgress] = useState(13);
  
  useEffect(() => {
    const timer = setTimeout(() => setProgress(90), 200);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Progress 
      value={progress} 
      className={cn("w-2/3 m-auto", className)}
    />
  );
});

ProgressLoader.displayName = "ProgressLoader";

const Skeleton = memo(({ className }: { className?: string }) => (
  <div className={cn("animate-pulse", className)} role="status" aria-label="Loading">
    <div className="bg-gray-200 rounded-md h-full w-full"></div>
  </div>
));

Skeleton.displayName = "Skeleton";

export const Loading = memo<LoadingProps>(({
  size = "md",
  variant = "progress",
  className,
  text,
  fullScreen = false,
}) => {
  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen && "fixed inset-0 bg-white bg-opacity-75 z-50",
    !fullScreen && "py-8",
    className
  );

  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return <Spinner size={size} />;
      case "dots":
        return <Dots size={size} />;
      case "skeleton":
        return <Skeleton className={SIZE_CLASSES[size]} />;
      case "progress":
      default:
        return <ProgressLoader className="my-52" />;
    }
  };

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-2">
        {renderLoader()}
        {text && (
          <p className="text-sm text-gray-600 animate-pulse" aria-live="polite">
            {text}
          </p>
        )}
      </div>
    </div>
  );
});

Loading.displayName = "Loading";

// Specialized loading components
export const PageLoading = memo(() => (
  <Loading 
    variant="spinner" 
    size="lg" 
    text="ກຳລັງໂຫຼດ..." 
    fullScreen 
  />
));

PageLoading.displayName = "PageLoading";

export const ButtonLoading = memo(() => (
  <Loading variant="spinner" size="sm" />
));

ButtonLoading.displayName = "ButtonLoading";

export const TableLoading = memo(() => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
));

TableLoading.displayName = "TableLoading";

// Legacy export for backward compatibility
export { Loading as default };
