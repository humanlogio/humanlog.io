export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <h1>{"the humanlog blog"}</h1>
      <div className="container-min-h-full container space-y-8 py-8">
        {children}
      </div>
    </>
  );
}
