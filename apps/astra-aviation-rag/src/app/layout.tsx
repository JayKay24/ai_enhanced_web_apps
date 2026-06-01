import './global.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Astra Aviation RAG - NTSB Aviation Reports Search',
  description: 'AI-enhanced NTSB aviation accident reports search powered by Gemini.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en">
        <body className="flex flex-col min-h-screen">{children}</body>
      </html>
    </ClerkProvider>
  );
}
