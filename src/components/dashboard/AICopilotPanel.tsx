import * as React from "react";
import { useState } from "react";
import { api } from "@/lib/api";
import { isOnline } from "@/lib/offline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Props {
  context: { baseline?: any; supplyChain?: any; feasibility?: any; scenario?: any; impact?: any };
}

export function AICopilotPanel({ context }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [presentation, setPresentation] = useState<string | null>(null);
  const [loading, setLoading] = useState("");
  const [source, setSource] = useState("");

  const fetchAI = async (endpoint: string, body: any, setter: (s: string) => void) => {
    if (!isOnline()) { setter("⚠️ AI tidak tersedia saat offline. Data dashboard tetap dapat diakses."); return; }
    setLoading(endpoint);
    try {
      const res = await api.post(`/ai/${endpoint}`, body);
      const key = endpoint === "recommendation" ? "recommendation" : "summary";
      setter(res.data[key]);
      setSource(res.data.source);
    } catch {
      setter("⚠️ AI gagal merespons. Ringkasan otomatis berikut berdasarkan data.");
    } finally { setLoading(""); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\*\*/g, ""));
  };

  const renderOutput = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.includes(":**")) {
        const [label, ...rest] = line.replace(/\*\*/g, "").split(":");
        return <h4 key={i} className="text-sm font-semibold mt-3 mb-1">{label}:{rest.join(":")}</h4>;
      }
      if (line.startsWith("-") || line.match(/^\d+\./)) {
        return <p key={i} className="text-xs text-muted-foreground ml-2">{line}</p>;
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-xs">{line}</p>;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🤖 AI Cooperative Copilot</CardTitle>
        {source && <p className="text-xs text-muted-foreground">Sumber: {source}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" disabled={!!loading}
            onClick={() => fetchAI("summary", { baseline: context.baseline, supplyChain: context.supplyChain }, setSummary)}>
            {loading === "summary" ? "Menganalisis..." : "Rangkum Kondisi"}
          </Button>
          <Button size="sm" variant="outline" disabled={!!loading}
            onClick={() => fetchAI("recommendation", { feasibility: context.feasibility, scenario: context.scenario, biggestRisk: "fluktuasi harga" }, setRecommendation)}>
            {loading === "recommendation" ? "Menganalisis..." : "Rekomendasi"}
          </Button>
          <Button size="sm" variant="outline" disabled={!!loading}
            onClick={() => fetchAI("presentation-summary", context, setPresentation)}>
            {loading === "presentation-summary" ? "Menganalisis..." : "Ringkasan Presentasi"}
          </Button>
        </div>

        {summary && (
          <div className="border rounded-md p-3 space-y-1">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">Rangkuman</Badge>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => copyToClipboard(summary)}>Salin</Button>
            </div>
            <div className="text-xs">{renderOutput(summary)}</div>
          </div>
        )}
        {recommendation && (
          <div className="border rounded-md p-3 space-y-1">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">Rekomendasi</Badge>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => copyToClipboard(recommendation)}>Salin</Button>
            </div>
            <div className="text-xs">{renderOutput(recommendation)}</div>
          </div>
        )}
        {presentation && (
          <div className="border rounded-md p-3 space-y-1">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">Ringkasan Presentasi</Badge>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => copyToClipboard(presentation)}>Salin</Button>
            </div>
            <div className="text-xs">{renderOutput(presentation)}</div>
          </div>
        )}
        {!summary && !recommendation && !presentation && !loading && (
          <p className="text-xs text-muted-foreground">Klik tombol di atas untuk mendapatkan analisis AI.</p>
        )}
      </CardContent>
    </Card>
  );
}
