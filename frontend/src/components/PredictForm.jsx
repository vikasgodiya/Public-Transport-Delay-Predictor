import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Lightning } from "@phosphor-icons/react";

const DEFAULTS = {
  transport_type: "Metro",
  route_id: "Route_5",
  departure_hour: 8,
  trip_duration_min: 30,
  weather_condition: "Clear",
  temperature_C: 20,
  precipitation_mm: 0,
  traffic_congestion_index: 0.5,
  event_type: "No Event",
  season: "Spring",
  holiday: false,
  day_of_week: "Monday",
};

const Field = ({ label, hint, children, testId, span = "" }) => (
  <div className={`p-5 border-b border-r border-black/15 ${span}`} data-testid={testId}>
    <Label className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/60 block mb-3">
      {label}
    </Label>
    {children}
    {hint && (
      <div className="font-mono text-[10px] tracking-wider text-black/40 mt-2 tabular-nums">{hint}</div>
    )}
  </div>
);

const styledSelectTrigger =
  "w-full h-11 border border-black/30 bg-white font-mono text-sm uppercase tracking-wider focus:border-black focus:ring-0";

const PredictForm = ({ options, onSubmit, loading }) => {
  const [form, setForm] = useState(DEFAULTS);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      departure_hour: Number(form.departure_hour),
      trip_duration_min: Number(form.trip_duration_min),
      temperature_C: Number(form.temperature_C),
      precipitation_mm: Number(form.precipitation_mm),
      traffic_congestion_index: Number(form.traffic_congestion_index),
    });
  };

  return (
    <form onSubmit={submit} data-testid="predict-form">
      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-black/15">
        <Field label="Transport Type" testId="field-transport">
          <Select value={form.transport_type} onValueChange={(v) => update("transport_type", v)}>
            <SelectTrigger className={styledSelectTrigger} data-testid="select-transport">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.transport_types.map((t) => (
                <SelectItem key={t} value={t} className="font-mono uppercase">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Route" testId="field-route">
          <Select value={form.route_id} onValueChange={(v) => update("route_id", v)}>
            <SelectTrigger className={styledSelectTrigger} data-testid="select-route">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {options.routes.map((r) => (
                <SelectItem key={r} value={r} className="font-mono uppercase">{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Departure Hour" hint={`24-HOUR · ${String(form.departure_hour).padStart(2, "0")}:00`} testId="field-hour">
          <Input
            data-testid="input-hour"
            type="number"
            min={0}
            max={23}
            value={form.departure_hour}
            onChange={(e) => update("departure_hour", e.target.value)}
            className="font-mono text-lg h-11 border-black/30 focus:border-black focus:ring-0"
          />
        </Field>

        <Field label="Trip Duration (min)" hint={`${form.trip_duration_min} MIN`} testId="field-duration">
          <Input
            data-testid="input-duration"
            type="number"
            min={1}
            max={600}
            value={form.trip_duration_min}
            onChange={(e) => update("trip_duration_min", e.target.value)}
            className="font-mono text-lg h-11 border-black/30 focus:border-black focus:ring-0"
          />
        </Field>

        <Field label="Weather Condition" testId="field-weather">
          <Select value={form.weather_condition} onValueChange={(v) => update("weather_condition", v)}>
            <SelectTrigger className={styledSelectTrigger} data-testid="select-weather">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.weather_conditions.map((w) => (
                <SelectItem key={w} value={w} className="font-mono uppercase">{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Temperature (°C)" hint={`${form.temperature_C}°C`} testId="field-temp">
          <Input
            data-testid="input-temp"
            type="number"
            step="0.5"
            min={-30}
            max={55}
            value={form.temperature_C}
            onChange={(e) => update("temperature_C", e.target.value)}
            className="font-mono text-lg h-11 border-black/30 focus:border-black focus:ring-0"
          />
        </Field>

        <Field label="Precipitation (mm)" hint={`${form.precipitation_mm} MM`} testId="field-precip">
          <Input
            data-testid="input-precip"
            type="number"
            step="0.5"
            min={0}
            max={200}
            value={form.precipitation_mm}
            onChange={(e) => update("precipitation_mm", e.target.value)}
            className="font-mono text-lg h-11 border-black/30 focus:border-black focus:ring-0"
          />
        </Field>

        <Field
          label="Traffic Congestion Index"
          hint={`${Number(form.traffic_congestion_index).toFixed(2)} / 1.00`}
          testId="field-traffic"
        >
          <Slider
            data-testid="slider-traffic"
            value={[Number(form.traffic_congestion_index)]}
            onValueChange={(v) => update("traffic_congestion_index", v[0])}
            min={0}
            max={1}
            step={0.01}
            className="mt-3"
          />
        </Field>

        <Field label="Event Type" testId="field-event">
          <Select value={form.event_type} onValueChange={(v) => update("event_type", v)}>
            <SelectTrigger className={styledSelectTrigger} data-testid="select-event">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.event_types.map((e) => (
                <SelectItem key={e} value={e} className="font-mono uppercase">{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Season" testId="field-season">
          <Select value={form.season} onValueChange={(v) => update("season", v)}>
            <SelectTrigger className={styledSelectTrigger} data-testid="select-season">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.seasons.map((s) => (
                <SelectItem key={s} value={s} className="font-mono uppercase">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Day of Week" testId="field-dow">
          <Select value={form.day_of_week} onValueChange={(v) => update("day_of_week", v)}>
            <SelectTrigger className={styledSelectTrigger} data-testid="select-dow">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.days_of_week.map((d) => (
                <SelectItem key={d} value={d} className="font-mono uppercase">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Holiday" hint={form.holiday ? "OFFICIAL HOLIDAY" : "REGULAR DAY"} testId="field-holiday">
          <div className="flex items-center gap-3 mt-1">
            <Switch
              data-testid="switch-holiday"
              checked={form.holiday}
              onCheckedChange={(v) => update("holiday", v)}
            />
            <span className="font-mono text-sm uppercase">{form.holiday ? "YES" : "NO"}</span>
          </div>
        </Field>
      </div>

      <div className="p-6 md:p-8 border-t border-black/15 bg-[#F0F0F0] flex items-center justify-between gap-4 flex-wrap">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/60">
          // PRESS COMPUTE TO RUN MODEL
        </div>
        <Button
          type="submit"
          disabled={loading}
          data-testid="submit-predict-btn"
          className="bg-[#002FA7] hover:bg-black text-white font-mono uppercase tracking-[0.25em] text-xs px-8 h-12 border border-[#002FA7] hover:border-black transition-colors"
        >
          <Lightning size={14} weight="bold" className="mr-2" />
          {loading ? "Computing..." : "Compute Forecast"}
        </Button>
      </div>
    </form>
  );
};

export default PredictForm;
