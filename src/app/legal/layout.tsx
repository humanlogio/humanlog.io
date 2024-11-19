export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container-h-full flex w-full flex-col items-center justify-center bg-[linear-gradient(to_right,#80808022_1px,transparent_1px),linear-gradient(to_bottom,#80808022_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="pt-12">
        <div className="container flex flex-col items-center justify-center space-y-12 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
