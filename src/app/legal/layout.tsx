export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container-h-full flex w-full flex-col items-center justify-center">
      <div className="pt-12">
        <div className="container flex flex-col items-center justify-center space-y-12 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
