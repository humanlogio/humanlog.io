export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container-h-full container max-w-screen-md py-8">
      <h1 className="text-2xl font-bold">the humanlog blog</h1>
      <div className="my-6 border-b-2 border-border"></div>
      <article className="prose prose-slate dark:prose-invert max-w-full">
        {children}
      </article>
    </div>
  );
}
