import './global.css';

export const metadata = {
  title: 'Astra AI - Next.js',
  description: 'AI-enhanced chat client powered by Gemini 2.5 Flash',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-white text-gray-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
