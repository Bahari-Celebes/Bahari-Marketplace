import * as React from "react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getCachedData, cacheData, isOnline } from "@/lib/offline";
import { getStoredUser } from "@/lib/auth";
import { KPICard } from "@/components/charts/KPICard";
import { MarginWaterfall } from "@/components/charts/MarginWaterfall";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import type { SupplyChainAnalysisData } from "@/lib/types";

export function SupplyChainAnalysis() {
  const [data, setData] = useState<SupplyChainAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const user = getStoredUser();

  useEffect(() => {
    async function fetch() {
      const coopId = user?.cooperativeId;
      if (!coopId) { setLoading(false); return; }
      const url = `/supply-chain/analysis?cooperativeId=${coopId}`;
      if (!isOnline()) {
        const cached = await getCachedData(url);
        if (cached) { setData(cached.data); setOffline(true); }
        setLoading(false); return;
      }
      try {
        const res = await api.get(url);
        setData(res.data);
        await cacheData(url, res);
      } catch {
        const cached = await getCachedData(url);
        if (cached) { setData(cached.data); setOffline(true); }
      } finally { setLoading(false); }
    }
    fetch();
  }, []);

  if (loading) return <div className="grid gap-4 md:grid-cols-3">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-28 rounded-xl"/>)}</div>;
  if (!data) return <p className="text-muted-foreground text-center py-12">Tidak ada data supply chain.</p>;

  const { summary, perCommodity } = data;

  const waterfallData = [
    { label: "Harga Nelayan", value: summary.valueDistribution.fisherPrice },
    { label: "+ Margin Koperasi", value: summary.valueDistribution.cooperativeMargin },
    { label: "= Harga Buyer", value: summary.valueDistribution.buyerPrice, isTotal: true },
    { label: "- Spoilage Impact", value: perCommodity.reduce((s,c)=>s+c.analysis.spoilageImpact,0), isLoss: true },
    { label: "- Leakage", value: summary.totalLeakage, isLoss: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-['Outfit']">Supply Chain & Margin Analysis</h2>
        {offline && <Badge variant="warning">Data offline</Badge>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KPICard title="Total Revenue" value={`Rp ${summary.totalRevenue.toLocaleString("id-ID")}`} trend="up" />
        <KPICard title="Total Leakage" value={`Rp ${summary.totalLeakage.toLocaleString("id-ID")}`} trend="down"
          description={summary.biggestLeakagePoint ? `Terbesar: ${summary.biggestLeakagePoint.commodity}` : ""} />
        <KPICard title="Avg Margin" value={`${(summary.avgMarginPct*100).toFixed(1)}%`}
          trend={summary.avgMarginPct > 0.08 ? "up" : "down"} />
      </div>

      <Card>
        <CardHeader><CardTitle>Margin Waterfall (per unit)</CardTitle></CardHeader>
        <CardContent><MarginWaterfall data={waterfallData} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Detail per Komoditas</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Komoditas</th>
                  <th className="py-2">Price Spread</th>
                  <th className="py-2">Margin</th>
                  <th className="py-2">Leakage</th>
                  <th className="py-2">Spoilage</th>
                  <th className="py-2">Volume Terserap</th>
                </tr>
              </thead>
              <tbody>
                {perCommodity.map((c,i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 font-medium">{c.record.commodityName}</td>
                    <td className="py-2">Rp {c.analysis.priceSpread.toLocaleString("id-ID")}</td>
                    <td className="py-2">{c.analysis.marginPct > 0 ? <span className="text-green-600">{(c.analysis.marginPct*100).toFixed(1)}%</span> : <span className="text-red-600">{(c.analysis.marginPct*100).toFixed(1)}%</span>}</td>
                    <td className="py-2 text-red-600">Rp {c.analysis.leakage.toLocaleString("id-ID")}</td>
                    <td className="py-2">Rp {c.analysis.spoilageImpact.toLocaleString("id-ID")} ({c.analysis.unabsorbedVolume.toFixed(1)} kg)</td>
                    <td className="py-2">{c.analysis.absorbedVolume.toFixed(1)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
