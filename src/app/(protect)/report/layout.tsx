import { ReactNode } from "react";

interface ReportLayoutProps {
  children: ReactNode;
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  return <>{children}</>;
}
