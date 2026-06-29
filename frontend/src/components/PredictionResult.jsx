import { CheckCircle, Warning, ArrowDown } from "@phosphor-icons/react";

const Bar = ({ label, value, color }) => (
  <div>
    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] mb-1">
      <span>{label}</span>
      <span className="tabular-nums">{(value * 100).toFixed(2)}%</span>
    </div>
    <div className="h-3 border border-black/20 bg-white">
      <div className="h-full" style={{ width: `${value * 100}%`, background: color }} />
    </div>
  </div>
);

const PredictionResult = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="p-8 md:p-10" data-testid="result-loading">
        <div className="font-mono text-xs uppercase tracking-[0.25em] text-black/70">
          Computing forecast<span className="cursor-blink">_</span>
        </div>
        <div className="mt-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-2 bg-black/10 animate-pulse" style={{ width: `${100 - i * 12}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 md:p-10" data-testid="result-empty">
        <div className="font-mono text-xs uppercase tracking-[0.25em] text-black/40">
          // Awaiting input
        </div>
        <div className="mt-8 flex items-center gap-3">
          <ArrowDown size={20} weight="bold" className="text-black/30" />
          <p className="font-display text-2xl font-bold uppercase tracking-tight text-black/30">
            Fill the form to see the forecast.
          </p>
        </div>
        <div className="mt-12 border border-black/15 bg-white p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/60 mb-3">
            // HOW IT WORKS
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><span className="font-mono text-black/60">01</span> Inputs feed a Random Forest classifier.</li>
            <li className="flex items-start gap-2"><span className="font-mono text-black/60">02</span> 12 user signals expand to 59 model features.</li>
            <li className="flex items-start gap-2"><span className="font-mono text-black/60">03</span> Model returns probability of delay.</li>
          </ul>
        </div>
      </div>
    );
  }

  const isDelayed = result.prediction === 1;
  const color = isDelayed ? "#FF3333" : "#00C05A";
  const Icon = isDelayed ? Warning : CheckCircle;

  return (
    <div className="p-8 md:p-10 flap-in" data-testid="prediction-result">
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-black/60">
        <Icon size={14} weight="fill" style={{ color }} />
        FORECAST · {new Date(result.created_at).toLocaleTimeString("en-GB")}
      </div>

      <div
        className="mt-4 font-display font-black uppercase leading-[0.85] tracking-tighter"
        style={{ color, fontSize: "clamp(48px, 10vw, 120px)" }}
        data-testid="result-label"
      >
        {result.label}
      </div>

      <div className="mt-2 font-mono text-xs uppercase tracking-[0.25em] text-black/60">
        Confidence <span className="tabular-nums text-black">{(result.confidence * 100).toFixed(2)}%</span>
      </div>

      <div className="mt-8 space-y-4">
        <Bar label="P(DELAYED)" value={result.delay_probability} color="#FF3333" />
        <Bar label="P(ON TIME)" value={result.on_time_probability} color="#00C05A" />
      </div>

      <div className="mt-8 border-t border-black/15 pt-6 grid grid-cols-2 gap-4 font-mono text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-black/60">Transport</div>
          <div className="mt-1 uppercase">{result.inputs.transport_type} · {result.inputs.route_id}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-black/60">Departure</div>
          <div className="mt-1 tabular-nums">{String(result.inputs.departure_hour).padStart(2, "0")}:00 / {result.inputs.day_of_week}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-black/60">Weather</div>
          <div className="mt-1 uppercase">{result.inputs.weather_condition} · {result.inputs.temperature_C}°C</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-black/60">Traffic</div>
          <div className="mt-1 tabular-nums">{(result.inputs.traffic_congestion_index * 100).toFixed(0)}% load</div>
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;
