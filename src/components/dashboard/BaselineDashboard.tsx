import * as React from "react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getCachedData, cacheData } from "@/lib/offline";
import { getStoredUser } from "@/lib/auth";
import { KPICard } from "@/components/charts/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { isOnline } from "@/lib/offline";
import type { BaselineMetrics } from "@/lib/types";

const COLORS = ["#0a4595", "#22c55e", "#f59e0b", "#ef4444", "#6366f1"];

export function BaselineDashboard() {
  const [data, setData] = useState<BaselineMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const user = getStoredUser();

  useEffect(() => {
    async function fetch() {
      const coopId = user?.cooperativeId;
      if (!coopId) { setLoading(false); return; }

      const url = `/cooperatives/${coopId}/baseline`;
      const online = isOnline();

      if (!online) {
        const cached = await getCachedData(url);
        if (cached) { setData(cached.data); setOffline(true); }
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(url);
        setData(res.data);
        await cacheData(url, res); // cache the full API response envelope
      } catch {
        const cached = await getCachedData(url);
        if (cached) { setData(cached.data); setOffline(true); }
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tidak ada data baseline. Silakan input data komoditas dan transaksi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-['Outfit']">Baseline Dashboard</h2>
          <p className="text-muted-foreground">{data.cooperativeName}</p>
        </div>
        {offline && <Badge variant="warning">Data offline</Badge>}
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Anggota" value={data.totalMembers} trend="neutral"
          description={`${data.activeMembers} aktif (${(data.activeRatio * 100).toFixed(0)}%)`} />
        <KPICard title="Volume Komoditas" value={data.totalVolume} unit="kg" trend="up" />
        <KPICard title="Nilai Transaksi" value={`Rp ${data.totalTxValue.toLocaleString("id-ID")}`}
          trend="up" description={`${data.txCount} transaksi`} />
        <KPICard title="Margin Koperasi" value={`${(data.marginPct * 100).toFixed(1)}%`}
          trend={data.marginPct > 0.1 ? "up" : data.marginPct > 0 ? "neutral" : "down"}
          description={`Harga beli rata-rata: Rp ${data.avgBuyPrice.toLocaleString("id-ID")}`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard title="Spoilage Rate" value={`${(data.spoilageRate * 100).toFixed(1)}%`}
          trend={data.spoilageRate > 0.05 ? "down" : "up"}
          description="Persentase komoditas rusak/hilang" />
        <KPICard title="Harga Jual Rata-rata" value={`Rp ${data.avgSellPrice.toLocaleString("id-ID")}`}
          trend="up" description="per unit" />
        <KPICard title="Total Komoditas" value={data.commodityCount}
          trend="neutral" description="jenis komoditas tercatat" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Distribusi Anggota</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={[
                  { name: "Aktif", value: data.activeMembers },
                  { name: "Non-Aktif", value: data.totalMembers - data.activeMembers },
                ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  <Cell fill="#22c55e" />
                  <Cell fill="#e5e7eb" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Perbandingan Harga</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: "Harga Beli", value: data.avgBuyPrice },
                { name: "Harga Jual", value: data.avgSellPrice },
              ]}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `Rp ${v.toLocaleString("id-ID")}`} />
                <Bar dataKey="value" fill="#0a4595" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
