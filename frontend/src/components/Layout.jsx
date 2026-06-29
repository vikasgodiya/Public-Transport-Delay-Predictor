import { TrainSimple, Lightning } from "@phosphor-icons/react";

const TickerStrip = () => {
  const items = [
    "LIVE PREDICTIONS",
    "RANDOM FOREST · 100 ESTIMATORS",
    "59 FEATURES",
    "SWISS PRECISION",
    "REAL-TIME ML INFERENCE",
    "TRANSIT DELAY ENGINE",
  ];
  const repeated = [...items, ...items, ...items];
  return (
    <div className="bg-black text-white py-2 overflow-hidden border-b border-black">
      <div className="marquee-track whitespace-nowrap flex gap-12">
        {repeated.map((t, i) => (
          <span key={i} className="font-mono text-xs tracking-[0.3em] flex items-center gap-3">
            <Lightning size={12} weight="fill" className="text-[#FFCC00]" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

const Header = () => (
  <header className="border-b border-black/15 bg-white">
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 flex items-end gap-4">
      <div className="bg-[#002FA7] text-white p-3">
        <TrainSimple size={32} weight="bold" />
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/60">
          TRANSIT INTELLIGENCE / V1.0
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">
          Delay Forecast Engine
        </h1>
      </div>
    </div>
    <div className="border-t border-black/15 bg-[#F0F0F0]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-black/70">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00C05A]"></span>
          SYSTEM ONLINE
        </span>
        <span className="tabular-nums">
          {new Date().toLocaleDateString("en-GB").replace(/\//g, ".")}
        </span>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="border-t border-black/15 bg-white mt-auto">
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 font-mono text-[10px] uppercase tracking-[0.3em] text-black/60 flex justify-between">
      <span>// TRANSIT DELAY PREDICTOR</span>
      <span>RANDOM FOREST · POWERED BY 59 SIGNALS</span>
    </div>
  </footer>
);

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <TickerStrip />
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default Layout;
