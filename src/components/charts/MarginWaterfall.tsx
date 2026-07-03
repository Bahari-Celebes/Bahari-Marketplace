import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface WaterfallData {
  label: string;
  value: number;
  isLoss?: boolean;
  isTotal?: boolean;
}

interface Props {
  data: WaterfallData[];
}

export function MarginWaterfall({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
        <XAxis type="number" tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v: number) => `Rp ${v.toLocaleString("id-ID")}`} />
        <Bar dataKey="value">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.isTotal ? "#0a4595" : entry.isLoss ? "#ef4444" : "#22c55e"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
