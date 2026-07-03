import * as React from "react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getCachedData, cacheData, isOnline, pushToSyncQueue } from "@/lib/offline";
import { getStoredUser } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import type { TransactionRecord } from "@/lib/types";

export function TransactionDataTable() {
  const user = getStoredUser();
  const coopId = user?.cooperativeId;
  const [data, setData] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");

  const fetch = async (p: number) => {
    if (!coopId) { setLoading(false); return; }
    setLoading(true);
    const params = new URLSearchParams({ cooperativeId: coopId, page: String(p), limit: "10" });
    if (status) params.set("paymentStatus", status);
    const url = `/transactions?${params}`;
    const cacheKey = `tx_${coopId}_p${p}`;
    if (!isOnline()) { const c = await getCachedData(cacheKey); if (c?.data) { setData(c.data); setTotal(c.pagination?.total||0); } setLoading(false); return; }
    try {
      const res = await api.get(url); setData(res.data); setTotal(res.pagination?.total||0); await cacheData(cacheKey, res);
    } catch { const c = await getCachedData(cacheKey); if (c?.data) setData(c.data); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(page); }, [page, status]);

  const totalPages = Math.ceil(total / 10);

  const payColors: Record<string, "success" | "warning" | "destructive"> = { paid: "success", pending: "warning", delayed: "destructive" };

  if (loading) return <div className="space-y-3">{[1,2,3,4,5].map(i=><Skeleton key={i} className="h-12 w-full rounded"/>)}</div>;
  if (!data.length) return <p className="text-muted-foreground text-center py-12">Belum ada data transaksi.</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Semua Status</option>
          <option value="paid">Lunas</option><option value="pending">Pending</option><option value="delayed">Terlambat</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left">
            <th className="py-2">Buyer</th><th className="py-2">Volume</th><th className="py-2">Harga Jual</th>
            <th className="py-2">Gross</th><th className="py-2">Logistik</th><th className="py-2">Status</th>
            <th className="py-2">Tanggal</th>
          </tr></thead>
          <tbody>
            {data.map(r => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2 font-medium">{r.buyerType}</td>
                <td className="py-2">{Number(r.volumeSold).toLocaleString("id-ID")} kg</td>
                <td className="py-2">Rp {Number(r.sellingPrice).toLocaleString("id-ID")}</td>
                <td className="py-2">Rp {Number(r.grossValue).toLocaleString("id-ID")}</td>
                <td className="py-2">Rp {Number(r.logisticsCost).toLocaleString("id-ID")}</td>
                <td className="py-2"><Badge variant={payColors[r.paymentStatus] || "outline"}>{r.paymentStatus}</Badge></td>
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

// Transaction Form (inline)
interface TxFormProps { onSaved: () => void; edit?: TransactionRecord; onCancel?: () => void; }

export function TransactionForm({ onSaved, edit, onCancel }: TxFormProps) {
  const user = getStoredUser();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [gross, setGross] = useState<number>(edit ? Number(edit.grossValue) : 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSaving(true); setError("");
    const form = e.currentTarget;
    const vol = parseFloat((form.elements.namedItem("volumeSold") as HTMLInputElement).value);
    const price = parseFloat((form.elements.namedItem("sellingPrice") as HTMLInputElement).value);
    const payload = {
      cooperativeId: user?.cooperativeId,
      commodityRecordId: (form.elements.namedItem("commodityRecordId") as HTMLInputElement).value || undefined,
      buyerType: (form.elements.namedItem("buyerType") as HTMLSelectElement).value,
      volumeSold: vol, sellingPrice: price, grossValue: vol * price,
      logisticsCost: parseFloat((form.elements.namedItem("logisticsCost") as HTMLInputElement).value) || 0,
      storageCost: parseFloat((form.elements.namedItem("storageCost") as HTMLInputElement).value) || 0,
      paymentStatus: (form.elements.namedItem("paymentStatus") as HTMLSelectElement).value as any,
      date: (form.elements.namedItem("date") as HTMLInputElement).value,
    };
    if (!isOnline()) { await pushToSyncQueue({ table: "transaction_records", operation: edit?"update":"insert", data: payload, recordId: edit?.id }); onSaved(); return; }
    try {
      if (edit) await api.patch(`/transactions/${edit.id}`, payload);
      else await api.post("/transactions", payload);
      onSaved();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const recalc = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const vol = parseFloat((form.elements.namedItem("volumeSold") as HTMLInputElement).value) || 0;
    const price = parseFloat((form.elements.namedItem("sellingPrice") as HTMLInputElement).value) || 0;
    setGross(vol * price);
  };

  return (
    <form onSubmit={handleSubmit} onChange={recalc} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div><label className="text-xs font-medium">Buyer Type</label>
          <select name="buyerType" required defaultValue={edit?.buyerType}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Pilih...</option>
            <option value="restoran">Restoran</option><option value="hotel">Hotel</option>
            <option value="retail">Retail</option><option value="rumah_tangga">Rumah Tangga</option>
          </select>
        </div>
        <div><label className="text-xs font-medium">Commodity Record ID (opsional)</label><Input name="commodityRecordId" defaultValue={edit?.commodityRecordId || ""} /></div>
        <div><label className="text-xs font-medium">Volume Sold (kg)</label><Input name="volumeSold" type="number" step="0.01" required defaultValue={edit?.volumeSold} /></div>
        <div><label className="text-xs font-medium">Selling Price (Rp)</label><Input name="sellingPrice" type="number" required defaultValue={edit?.sellingPrice} /></div>
        <div><label className="text-xs font-medium">Gross Value</label><p className="text-sm font-semibold py-2">Rp {gross.toLocaleString("id-ID")}</p></div>
        <div><label className="text-xs font-medium">Logistics Cost (Rp)</label><Input name="logisticsCost" type="number" defaultValue={edit?.logisticsCost || "0"} /></div>
        <div><label className="text-xs font-medium">Storage Cost (Rp)</label><Input name="storageCost" type="number" defaultValue={edit?.storageCost || "0"} /></div>
        <div><label className="text-xs font-medium">Payment Status</label>
          <select name="paymentStatus" required defaultValue={edit?.paymentStatus || "pending"}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="paid">Lunas</option><option value="pending">Pending</option><option value="delayed">Terlambat</option>
          </select>
        </div>
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
