import React from "react";
import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, Tooltip, CartesianGrid, YAxis } from "recharts";

type BarDatum = { label: string; value: number };

const inrFormatter = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export function BarChart({ data, height = 160 }: { data: BarDatum[]; height?: number }) {
  if (!data || data.length === 0) return <div style={{ height }} />;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <ReBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.6} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))} width={56} />
          <Tooltip formatter={(value: number | string) => inrFormatter(Number(value))} labelFormatter={(label) => `Period ${label}`} wrapperStyle={{ boxShadow: "0 6px 20px rgba(0,0,0,0.08)", borderRadius: 8 }} />
          <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChart;
