import { getUser, getAuthorizationUrl } from '@/lib/auth';
import { Button } from './ui/button';
import { SquareUser } from 'lucide-react';
import Link from 'next/link';
import { getURL } from '@/lib/helpers';

export async function SignInButton({ large }: { large?: boolean; }) {
  // TODO determine login status from AuthKit

  const { isAuthenticated } = await getUser();

  if (isAuthenticated) {
    return (
      <form action={async () => {
        "use server";
        // TODO log the user out
      }}>
        <Button
          variant="ghost"
          size="icon"
          className="mt-auto rounded-lg"
          aria-label="Account">
          <Link href={getURL('/account')}><SquareUser /></Link> 
        </Button>
      </form>
    );
  }

  const authorizationUrl = await getAuthorizationUrl();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="mt-auto rounded-lg"
      aria-label="Account">
      <Link href={authorizationUrl}><SquareUser /></Link>
    </Button>
  );
}