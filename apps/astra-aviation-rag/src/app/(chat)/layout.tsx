import { Navbar, Footer } from '@ai-enhanced-web-apps/chat-ui';
import { AI } from './actions';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AI>
      <header className="sticky top-0 z-50 flex items-center justify-between w-full px-4 border-b h-14 shrink-0 bg-background backdrop-blur-xl">
        <Navbar />
      </header>
      <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
      <Footer />
    </AI>
  );
}
