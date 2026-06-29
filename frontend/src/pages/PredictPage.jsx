import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchOptions, predict } from "@/lib/api";
import Layout from "@/components/Layout";
import PredictForm from "@/components/PredictForm";
import PredictionResult from "@/components/PredictionResult";
import { ArrowRight, Cpu, Gauge, ChartBar } from "@phosphor-icons/react";

const PredictPage = () => {
  const [options, setOptions] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions().then(setOptions).catch(() => toast.error("Failed to load options"));
  }, []);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await predict(payload);
      setResult(data);
      toast.success(`Prediction: ${data.label}`);
      setTimeout(() => {
        document.getElementById("result-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-black/15 mb-12">
          <div className="lg:col-span-8 p-8 md:p-12 bg-white border-r border-black/15">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#002FA7] mb-4">
              // PREDICTION INTERFACE
            </div>
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
              Will your<br />
              <span className="text-[#002FA7]">transit</span> run<br />
              on time?
            </h2>
            <p className="mt-6 max-w-xl text-black/70 leading-relaxed text-base">
              A Random Forest classifier, trained on 59 operational signals — weather, traffic,
              events, and routing — projects whether your next trip will be delayed. Enter the
              twelve key parameters below.
            </p>
            <div className="mt-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em]">
              <ArrowRight size={16} weight="bold" />
              <span>Scroll to forecast</span>
              <span className="cursor-blink">_</span>
            </div>
          </div>
          <div className="lg:col-span-4 bg-black text-white p-8 md:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <Stat icon={Cpu} label="MODEL" value="RandomForest" />
              <Stat icon={Gauge} label="ESTIMATORS" value="100" />
              <Stat icon={ChartBar} label="FEATURES" value="59" />
            </div>
            <div className="mt-8 pt-6 border-t border-white/20 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
              Inference latency<br />
              <span className="text-white text-base tabular-nums">&lt; 200ms</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-black/15">
          <div className="lg:col-span-7 bg-white border-b lg:border-b-0 lg:border-r border-black/15">
            <div className="px-6 md:px-8 py-5 border-b border-black/15 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold uppercase tracking-tight">Trip Parameters</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/60">12 INPUTS</span>
            </div>
            {options ? (
              <PredictForm options={options} onSubmit={handleSubmit} loading={loading} />
            ) : (
              <div className="p-8 font-mono text-xs uppercase tracking-[0.25em] text-black/60">
                Loading options<span className="cursor-blink">_</span>
              </div>
            )}
          </div>
          <div id="result-anchor" className="lg:col-span-5 bg-[#F0F0F0]">
            <div className="px-6 md:px-8 py-5 border-b border-black/15 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold uppercase tracking-tight">Forecast</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/60">OUTPUT</span>
            </div>
            <PredictionResult result={result} loading={loading} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

const Stat = ({ icon: Icon, label, value }) => (
  <div>
    <div className="flex items-center gap-2 text-white/60 font-mono text-[10px] uppercase tracking-[0.3em]">
      <Icon size={12} weight="bold" />
      {label}
    </div>
    <div className="font-mono text-2xl mt-1 tabular-nums">{value}</div>
  </div>
);

export default PredictPage;
