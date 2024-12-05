export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container-h-full prose prose-slate dark:prose-invert container max-w-screen-md py-8">
      <h1>the humanlog blog</h1>
      <div className="mb-6 border-b-2 border-border"></div>
      {children}
    </div>
  );
}
