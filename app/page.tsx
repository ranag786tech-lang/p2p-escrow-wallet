import { Header, Footer } from '@/components/HeaderFooter';
import P2PCalculator from '@/components/P2PCalculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <P2PCalculator />
      </main>
      <Footer />
    </div>
  );
}
