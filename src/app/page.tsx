import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>Hello World</h1>
      <p>This is a body text 1234567890</p>
      <Button>I am button!</Button>
      <Button variant="neutral">I am neutral button!</Button>
    </main>
  );
}
