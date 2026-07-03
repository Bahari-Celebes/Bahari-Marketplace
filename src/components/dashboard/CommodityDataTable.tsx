import * as React from "react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getCachedData, cacheData, isOnline, pushToSyncQueue } from "@/lib/offline";
import { getStoredUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import type { CommodityRecord, PaginatedResponse } from "@/lib/types";

export function CommodityDataTable() {
  const user = getStoredUser();
  const coopId = user?.cooperativeId;
  const [data, setData] = useState<CommodityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const fetch = async (p: number) => {
    if (!coopId) { setLoading(false); return; }
    setLoading(true);
    const params = new URLSearchParams({ cooperativeId: coopId, page: String(p), limit: "10" });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    const url = `/commodities?${params}`;
    const cacheKey = `commodities_${coopId}_p${p}`;
    if (!isOnline()) { const c = await getCachedData(cacheKey); if (c?.data) { setData(c.data); setTotal(c.pagination?.total||0); } setLoading(false); return; }
    try {
      const res = await api.get(url);
      setData(res.data);
      setTotal(res.pagination?.total || 0);
      await cacheData(cacheKey, res);
    } catch { const c = await getCachedData(cacheKey); if (c?.data) setData(c.data); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(page); }, [page, category, search]);

  const totalPages = Math.ceil(total / 10);

  if (loading) return <div className="space-y-3">{[1,2,3,4,5].map(i=><Skeleton key={i} className="h-12 w-full rounded"/>)}</div>;
  if (!data.length) return <p className="text-muted-foreground text-center py-12">Belum ada data komoditas. Silakan input data.</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Cari komoditas..." value={search} onChange={(e:any)=>setSearch(e.target.value)} className="max-w-xs" />
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Semua Kategori</option>
          <option value="ikan">Ikan</option><option value="rumput_laut">Rumput Laut</option><option value="udang">Udang</option>
          <option value="kerang">Kerang</option><option value="olahan">Olahan</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left">
            <th className="py-2">Nama</th><th className="py-2">Kategori</th><th className="py-2">Volume</th>
            <th className="py-2">Harga Beli</th><th className="py-2">Harga Jual</th><th className="py-2">Spoilage</th>
            <th className="py-2">Tanggal</th>
          </tr></thead>
          <tbody>
            {data.map(r => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2 font-medium">{r.commodityName}</td>
                <td className="py-2"><Badge variant="outline">{r.category}</Badge></td>
                <td className="py-2">{Number(r.volume).toLocaleString("id-ID")} {r.unit}</td>
                <td className="py-2">Rp {Number(r.buyPrice).toLocaleString("id-ID")}</td>
                <td className="py-2">Rp {Number(r.expectedSellPrice).toLocaleString("id-ID")}</td>
                <td className="py-2">{(Number(r.spoilagePercentage)*100).toFixed(1)}%</td>
                <td className="py-2 text-xs">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          <Button size="sm" variant="outline" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>←</Button>
          <span className="text-sm py-2">Hal {page} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>→</Button>
        </div>
      )}
    </div>
  );
}

// Commodity Form (inline, for create/edit)
interface CommodityFormProps {
  onSaved: () => void;
  edit?: CommodityRecord;
  onCancel?: () => void;
}

export function CommodityForm({ onSaved, edit, onCancel }: CommodityFormProps) {
  const user = getStoredUser();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true); setError("");
    const form = e.currentTarget;
    const payload = {
      cooperativeId: user?.cooperativeId,
      commodityName: (form.elements.namedItem("commodityName") as HTMLInputElement).value,
      category: (form.elements.namedItem("category") as HTMLSelectElement).value,
      volume: parseFloat((form.elements.namedItem("volume") as HTMLInputElement).value),
      unit: (form.elements.namedItem("unit") as HTMLSelectElement).value,
      sourceGroup: (form.elements.namedItem("sourceGroup") as HTMLInputElement).value,
      buyPrice: parseFloat((form.elements.namedItem("buyPrice") as HTMLInputElement).value),
      expectedSellPrice: parseFloat((form.elements.namedItem("expectedSellPrice") as HTMLInputElement).value),
      actualSellPrice: parseFloat((form.elements.namedItem("actualSellPrice") as HTMLInputElement).value) || undefined,
      spoilagePercentage: parseFloat((form.elements.namedItem("spoilagePercentage") as HTMLInputElement).value) / 100,
      date: (form.elements.namedItem("date") as HTMLInputElement).value,
    };

    if (!isOnline()) {
      await pushToSyncQueue({ table: "commodity_records", operation: edit ? "update" : "insert", data: payload, recordId: edit?.id });
      onSaved();
      return;
    }

    try {
      if (edit) {
        await api.patch(`/commodities/${edit.id}`, payload);
      } else {
        await api.post("/commodities", payload);
      }
      onSaved();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div><label className="text-xs font-medium">Nama Komoditas</label><Input name="commodityName" required defaultValue={edit?.commodityName} /></div>
        <div><label className="text-xs font-medium">Kategori</label>
          <select name="category" required defaultValue={edit?.category}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Pilih...</option>
            <option value="ikan">Ikan</option><option value="rumput_laut">Rumput Laut</option>
            <option value="udang">Udang</option><option value="kerang">Kerang</option><option value="olahan">Olahan</option>
          </select>
        </div>
        <div><label className="text-xs font-medium">Volume</label><Input name="volume" type="number" step="0.01" required defaultValue={edit?.volume} /></div>
        <div><label className="text-xs font-medium">Unit</label>
          <select name="unit" required defaultValue={edit?.unit}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="kg">kg</option><option value="ton">ton</option><option value="pack">pack</option>
          </select>
        </div>
        <div><label className="text-xs font-medium">Sumber</label><Input name="sourceGroup" required defaultValue={edit?.sourceGroup} /></div>
        <div><label className="text-xs font-medium">Harga Beli (Rp)</label><Input name="buyPrice" type="number" required defaultValue={edit?.buyPrice} /></div>
        <div><label className="text-xs font-medium">Harga Jual Ekspektasi (Rp)</label><Input name="expectedSellPrice" type="number" required defaultValue={edit?.expectedSellPrice} /></div>
        <div><label className="text-xs font-medium">Harga Jual Aktual (Rp)</label><Input name="actualSellPrice" type="number" defaultValue={edit?.actualSellPrice || ""} /></div>
        <div><label className="text-xs font-medium">Spoilage (%)</label><Input name="spoilagePercentage" type="number" step="0.1" defaultValue={edit ? String(Number(edit.spoilagePercentage)*100) : "5"} /></div>
        <div><label className="text-xs font-medium">Tanggal</label><Input name="date" type="date" required defaultValue={edit?.date || new Date().toISOString().slice(0,10)} /></div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>{saving ? "Menyimpan..." : edit ? "Update" : "Simpan"}</Button>
        {onCancel && <Button type="button" size="sm" variant="outline" onClick={onCancel}>Batal</Button>}
      </div>
    </form>
  );
}
