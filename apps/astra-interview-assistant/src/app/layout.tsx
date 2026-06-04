import './global.css';
import { ClerkProvider } from '@clerk/nextjs';

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
        </body>
      </html>
    </ClerkProvider>
  );
}
