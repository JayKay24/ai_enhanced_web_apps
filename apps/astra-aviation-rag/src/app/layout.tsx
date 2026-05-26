import './global.css';

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
      <body className="flex flex-col min-h-screen">{children}</body>
    </html>
  );
}
