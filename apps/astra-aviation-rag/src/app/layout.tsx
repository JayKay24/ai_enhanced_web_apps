import './global.css';
import { Navbar, Footer } from '@ai-enhanced-web-apps/chat-ui';
import { AI } from './actions';

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
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AI>
          <header className="sticky top-0 z-50 flex items-center justify-between w-full px-4 border-b h-14 shrink-0 bg-background backdrop-blur-xl">
            <Navbar />
          </header>
          <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
          <Footer />
        </AI>
      </body>
    </html>
  );
}
