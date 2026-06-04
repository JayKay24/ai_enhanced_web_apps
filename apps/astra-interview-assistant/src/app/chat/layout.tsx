import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InterviewSidebar from '../../components/InterviewSidebar';

export const dynamic = 'force-dynamic';

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b h-14 shrink-0 bg-background backdrop-blur-xl">
        <Navbar />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <InterviewSidebar />
        <main className="flex flex-col flex-1 bg-muted/50 overflow-auto">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
