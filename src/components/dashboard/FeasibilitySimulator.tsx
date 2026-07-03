import * as React from "react";
import { useState } from "react";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { KPICard } from "@/components/charts/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { calculateFeasibility, SCENARIO_PRESETS, type FeasibilityInput, type FeasibilityResult } from "@/lib/engine";

const statusColors: Record<string, "success" | "warning" | "destructive"> = {
  layak: "success",
  waspada: "warning",
  tidak_layak: "destructive",
};

export function FeasibilitySimulator() {
  const user = getStoredUser();
  const [inputs, setInputs] = useState<FeasibilityInput>({
    capex: 50_000_000, monthlyOpex: 5_000_000, monthlyRevenue: 12_000_000,
    margin: 0.35, discountRate: 0.12, projectionMonths: 24, growthRate: 0.02,
    logisticsCost: 1_000_000, spoilageAssumption: 0.05,
  });
  const [result, setResult] = useState<FeasibilityResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Recalculate instantly on any input change (client-side, NFR-003)
  React.useEffect(() => {
    setResult(calculateFeasibility(inputs));
    setSaved(false);
  }, [inputs]);

  const update = (field: keyof FeasibilityInput, raw: string) => {
    const val = parseFloat(raw) || 0;
    setInputs((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    if (!user?.cooperativeId || !result) return;
    setSaving(true);
    try {
      await api.post("/feasibility/scenarios", {
        ...inputs, cooperativeId: user.cooperativeId, scenarioName: "custom",
      });
      setSaved(true);
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold font-['Outfit']">Financial Feasibility Simulator</h2>

      {/* Input form */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1"><label className="text-xs font-medium">CAPEX (Rp)</label><Input type="number" value={inputs.capex} onChange={(e:any)=>update("capex",e.target.value)} /></div>
        <div className="space-y-1"><label className="text-xs font-medium">OPEX Bulanan (Rp)</label><Input type="number" value={inputs.monthlyOpex} onChange={(e:any)=>update("monthlyOpex",e.target.value)} /></div>
        <div className="space-y-1"><label className="text-xs font-medium">Revenue Bulanan (Rp)</label><Input type="number" value={inputs.monthlyRevenue} onChange={(e:any)=>update("monthlyRevenue",e.target.value)} /></div>
        <div className="space-y-1"><label className="text-xs font-medium">Margin (%)</label><Input type="number" step="0.01" value={inputs.margin} onChange={(e:any)=>update("margin",e.target.value)} /></div>
        <div className="space-y-1"><label className="text-xs font-medium">Discount Rate (%)</label><Input type="number" step="0.01" value={inputs.discountRate} onChange={(e:any)=>update("discountRate",e.target.value)} /></div>
        <div className="space-y-1"><label className="text-xs font-medium">Proyeksi (bulan)</label><Input type="number" value={inputs.projectionMonths} onChange={(e:any)=>update("projectionMonths",e.target.value)} /></div>
        <div className="space-y-1"><label className="text-xs font-medium">Growth Rate (%)</label><Input type="number" step="0.001" value={inputs.growthRate} onChange={(e:any)=>update("growthRate",e.target.value)} /></div>
        <div className="space-y-1"><label className="text-xs font-medium">Biaya Logistik (Rp)</label><Input type="number" value={inputs.logisticsCost} onChange={(e:any)=>update("logisticsCost",e.target.value)} /></div>
        <div className="space-y-1"><label className="text-xs font-medium">Spoilage (%)</label><Input type="number" step="0.001" value={inputs.spoilageAssumption} onChange={(e:any)=>update("spoilageAssumption",e.target.value)} /></div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard title="NPV" value={`Rp ${result.npv.toLocaleString("id-ID")}`}
              trend={result.npv > 0 ? "up" : "down"} />
            <KPICard title="IRR" value={result.irr !== null ? `${(result.irr * 100).toFixed(1)}%` : "—"}
              trend={result.irr !== null && result.irr > inputs.discountRate ? "up" : "down"} />
            <KPICard title="Payback Period" value={result.paybackPeriod !== null ? `${result.paybackPeriod.toFixed(1)} bln` : "—"}
              trend="neutral" />
            <KPICard title="BCR" value={result.bcr.toFixed(2)}
              trend={result.bcr > 1 ? "up" : "down"} />
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={statusColors[result.status] || "secondary"} className="text-lg px-4 py-1">
              {result.status.toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {result.status === "layak" ? "Usaha layak dijalankan" : result.status === "waspada" ? "Perlu kaji ulang asumsi" : "Usaha tidak layak dengan asumsi saat ini"}
            </span>
            <div className="flex-1" />
            <Button size="sm" onClick={handleSave} disabled={saving || saved}>
              {saved ? "Tersimpan ✓" : saving ? "Menyimpan..." : "Simpan Skenario"}
            </Button>
          </div>

          {/* Assumptions (NFR-005) */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Asumsi Perhitungan</CardTitle></CardHeader>
            <CardContent className="text-xs text-muted-foreground grid gap-1 md:grid-cols-2">
              <span>CAPEX: Rp {inputs.capex.toLocaleString("id-ID")}</span>
              <span>OPEX: Rp {inputs.monthlyOpex.toLocaleString("id-ID")}/bln</span>
              <span>Revenue: Rp {inputs.monthlyRevenue.toLocaleString("id-ID")}/bln</span>
              <span>Discount Rate: {(inputs.discountRate*100).toFixed(1)}%/thn</span>
              <span>Growth: {(inputs.growthRate*100).toFixed(1)}%/bln</span>
              <span>Spoilage: {(inputs.spoilageAssumption*100).toFixed(1)}%</span>
              <span>Horizon: {inputs.projectionMonths} bulan</span>
              <span>Margin: {(inputs.margin*100).toFixed(0)}%</span>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
