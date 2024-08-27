import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="h-screen">
      <PageHeader />
      <h1>Hello World</h1>
      <p>This is a body text 1234567890</p>
      <Button>I am button!</Button>
      <Button variant="neutral">I am neutral button!</Button>
    </main>
  );
}
