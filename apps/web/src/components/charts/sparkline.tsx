import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, YAxis } from "recharts";

type SparklineProps = {
  data: number[];
  color?: string;
  height?: number;
};

export function Sparkline({ data, color = "#3b82f6", height = 48 }: SparklineProps) {
  const chartData = (data || []).map((v, i) => ({ x: i, y: v }));

  if (!chartData || chartData.length === 0) return <div style={{ height }} />;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 6, right: 8, left: 0, bottom: 6 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.16} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" hide />
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Tooltip
            formatter={(value: number | string) => [value, "value"]}
            labelFormatter={(label) => `Index ${label}`}
            wrapperStyle={{ pointerEvents: "auto" }}
            contentStyle={{ borderRadius: 8, padding: 8, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
          />
          <Area
            type="monotone"
            dataKey="y"
            stroke={color}
            fill="url(#sparkGrad)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Sparkline;
