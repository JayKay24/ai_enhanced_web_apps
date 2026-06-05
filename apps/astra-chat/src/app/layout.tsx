import './global.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Astra Chat',
  description: "Hello, I'm ✴️ Astra. Ask me anything you want.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
