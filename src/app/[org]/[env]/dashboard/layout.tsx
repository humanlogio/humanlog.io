import { ActiveTransportProvider } from "@/context/api-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ActiveTransportProvider>{children}</ActiveTransportProvider>;
}
