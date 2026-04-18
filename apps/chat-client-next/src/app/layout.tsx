import './global.css';

export const metadata = {
  title: 'Astra AI - AI Assistant',
  description: 'AI-enhanced chat client powered by Gemini.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">{children}</body>
    </html>
  );
}
