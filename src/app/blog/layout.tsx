export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container-h-full container prose prose-slate max-w-screen-md py-8 dark:prose-invert">
      <h1>the humanlog blog</h1>
      <div className="mb-6 border-b-2 border-border"></div>
      {children}
    </div>
  );
}
