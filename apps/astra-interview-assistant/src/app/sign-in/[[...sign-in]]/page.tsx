import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 py-24">
      <SignIn fallbackRedirectUrl="/" />
    </div>
  );
}
