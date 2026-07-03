import * as React from "react";
import { useState, useCallback } from "react";
import { getStoredUser } from "@/lib/auth";
import { KPICard } from "@/components/charts/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import {
  calculateFeasibility, calculateAllSwitchingValues,
  SCENARIO_PRESETS, NO_ADJUSTMENT,
  type FeasibilityInput, type FeasibilityResult, type ScenarioAdjustments, type SwitchingValue,
} from "@/lib/engine";

export function ScenarioAnalysis() {
  const user = getStoredUser();
  const [base, setBase] = useState<FeasibilityInput>({
    capex: 50_000_000, monthlyOpex: 5_000_000, monthlyRevenue: 12_000_000,
    margin: 0.35, discountRate: 0.12, projectionMonths: 24, growthRate: 0.02,
    logisticsCost: 1_000_000, spoilageAssumption: 0.05,
  });

  const [adj, setAdj] = useState<ScenarioAdjustments>({ ...NO_ADJUSTMENT });
  const [switching, setSwitching] = useState<SwitchingValue[] | null>(null);
  const [activePreset, setActivePreset] = useState<string>("moderat");

  const result = React.useMemo(() => calculateFeasibility(base, adj), [base, adj]);
  const presets = React.useMemo(() => SCENARIO_PRESETS.map(p => ({
    ...p,
    result: calculateFeasibility(base, p.adjustments),
  })), [base]);

  const applyPreset = (name: string) => {
    const preset = SCENARIO_PRESETS.find(p => p.name === name);
    if (preset) { setAdj(preset.adjustments); setActivePreset(name); }
  };

  const sliderChange = (key: keyof ScenarioAdjustments, v: number) => {
    setAdj(prev => ({ ...prev, [key]: v }));
    setActivePreset("custom");
  };

  const handleSwitching = () => {
    setSwitching(calculateAllSwitchingValues(base));
  };

  const labelOf = (v: keyof ScenarioAdjustments) => {
    const m: Record<string, string> = { priceAdjustment: "Harga Jual", costAdjustment: "Biaya Operasional", volumeAdjustment: "Volume", spoilageAdjustment: "Spoilage", paymentDelayDays: "Delay Bayar (hari)" };
    return m[v] || v;
  };

  const statusColor = (s: string) => s === "layak" ? "success" : s === "waspada" ? "warning" : "destructive";

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold font-['Outfit']">Scenario & Sensitivity Analysis</h2>

      {/* Presets */}
      <div className="flex gap-3">
        {presets.map(p => (
          <Button key={p.name} variant={activePreset === p.name ? "default" : "outline"} size="sm" onClick={() => applyPreset(p.name)}>
            {p.label}
          </Button>
        ))}
      </div>

      {/* Sliders */}
      <div className="grid gap-4 md:grid-cols-2">
        {([
          { key: "priceAdjustment", min: -0.3, max: 0.3, step: 0.01 },
          { key: "costAdjustment", min: -0.2, max: 0.3, step: 0.01 },
          { key: "volumeAdjustment", min: -0.3, max: 0.3, step: 0.01 },
          { key: "spoilageAdjustment", min: -0.05, max: 0.2, step: 0.005 },
        ] as const).map(({ key, min, max, step }) => (
          <div key={key} className="space-y-1">
            <label className="text-xs font-medium flex justify-between">
              <span>{labelOf(key)}</span>
              <span className={adj[key] >= 0 ? "text-green-600" : "text-red-600"}>
                {adj[key] >= 0 ? "+" : ""}{(adj[key] * 100).toFixed(0)}%
              </span>
            </label>
            <input type="range" min={min} max={max} step={step} value={adj[key]}
              onChange={e => sliderChange(key, parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer" />
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <Card>
        <CardHeader><CardTitle>Perbandingan Skenario</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left">
                <th className="py-2">Skenario</th><th className="py-2">NPV</th><th className="py-2">IRR</th><th className="py-2">BCR</th><th className="py-2">Status</th>
              </tr></thead>
              <tbody>
                {presets.map(p => (
                  <tr key={p.name} className="border-b last:border-0">
                    <td className="py-2 font-medium">{p.label}</td>
                    <td className="py-2">Rp {p.result.npv.toLocaleString("id-ID")}</td>
                    <td className="py-2">{p.result.irr !== null ? `${(p.result.irr*100).toFixed(1)}%` : "—"}</td>
                    <td className="py-2">{p.result.bcr.toFixed(2)}</td>
                    <td className="py-2"><Badge variant={statusColor(p.result.status) as any}>{p.result.status.toUpperCase()}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Switching Value */}
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={handleSwitching}>Hitung Switching Value</Button>
        {switching && <span className="text-xs text-muted-foreground">Batas kritis perubahan variabel sebelum tidak layak</span>}
      </div>
      {switching && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {switching.map((sv, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{labelOf(sv.variable)}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {sv.breakEvenDelta !== null
                    ? `${(Math.abs(sv.breakEvenDelta) * 100).toFixed(1)}% ${sv.breakEvenDelta < 0 ? "turun" : "naik"}`
                    : "Tidak sensitif"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">dari baseline ({sv.baselineStatus})</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
