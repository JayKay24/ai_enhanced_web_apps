import './global.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Astra AI',
  description: "Hello, I'm ✴️ Astra. Ask me anything you want.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html>
        <body>
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
