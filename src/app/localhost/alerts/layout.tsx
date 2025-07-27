import { ActiveTransportProvider } from "@/context/api-provider";

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ActiveTransportProvider>{children}</ActiveTransportProvider>;
}
