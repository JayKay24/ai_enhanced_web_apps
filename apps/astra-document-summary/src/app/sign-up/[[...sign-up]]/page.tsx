import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 py-24">
      <SignUp fallbackRedirectUrl="/" />
    </div>
  );
}
