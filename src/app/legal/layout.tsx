export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container-h-full container space-y-8 py-8">{children}</div>
  );
}
