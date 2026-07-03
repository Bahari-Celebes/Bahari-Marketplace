import * as React from "react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getCachedData, cacheData, isOnline } from "@/lib/offline";
import { getStoredUser } from "@/lib/auth";
import { KPICard } from "@/components/charts/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import type { ImpactMetrics } from "@/lib/types";

const labelColors: Record<string, "success" | "warning" | "outline"> = {
  aktual: "success", estimasi: "warning", proyeksi: "outline",
};

export function ImpactDashboard() {
  const [data, setData] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const user = getStoredUser();

  useEffect(() => {
    async function fetch() {
      const coopId = user?.cooperativeId; if (!coopId) { setLoading(false); return; }
      const url = `/impact/metrics?cooperativeId=${coopId}`;
      if (!isOnline()) { const c = await getCachedData(url); if (c) { setData(c.data); setOffline(true); } setLoading(false); return; }
      try { const r = await api.get(url); setData(r.data); await cacheData(url, r); } catch { const c = await getCachedData(url); if (c) { setData(c.data); setOffline(true); } } finally { setLoading(false); }
    }
    fetch();
  }, []);

  if (loading) return <div className="grid gap-4 md:grid-cols-3">{[1,2,3,4,5,6].map(i=><Skeleton key={i} className="h-28 rounded-xl"/>)}</div>;
  if (!data) return <p className="text-muted-foreground text-center py-12">Tidak ada data impact.</p>;

  const metrics = Object.entries(data.metrics);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-['Outfit']">Social & Economic Impact</h2>
          <p className="text-muted-foreground">{data.cooperativeName} — {data.memberCount} anggota, {data.totalTxValue.toLocaleString("id-ID")} total transaksi</p>
        </div>
        {offline && <Badge variant="warning">Data offline</Badge>}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map(([key, m]) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">{m.description}</CardTitle>
              <Badge variant={labelColors[m.label] || "outline"}>{m.label}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof m.value === "number" && m.value > 1
                  ? (m.value < 1 ? `${(m.value * 100).toFixed(1)}%` : `Rp ${m.value.toLocaleString("id-ID")}`)
                  : `${(m.value * 100).toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KPICard title="Total Volume" value={`${data.totalVolume.toFixed(0)} kg`} trend="up" />
        <KPICard title="Nilai Transaksi" value={`Rp ${data.totalTxValue.toLocaleString("id-ID")}`} trend="up" />
        <KPICard title="Jumlah Transaksi" value={data.txCount} trend="neutral" />
      </div>
    </div>
  );
}
