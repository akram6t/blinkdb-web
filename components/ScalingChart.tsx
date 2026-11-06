import { SCALING_P4, fmtK } from "@/lib/data";

const W = 640, H = 340, L = 64, R = 30, T = 24, B = 48;
const X = (i: number) => L + (i * (W - L - R)) / (SCALING_P4.cores.length - 1);
const MAX = 1_000_000;
const Y = (v: number) => T + (1 - v / MAX) * (H - T - B);

const series = [
  { key: "df", name: "DragonflyDB", color: "#8b7cff", data: SCALING_P4.df },
  { key: "rt", name: "Redis Tuned", color: "#6b7590", data: SCALING_P4.rt },
  { key: "bd", name: "BlinkDB", color: "var(--accent)", data: SCALING_P4.bd },
] as const;

export default function ScalingChart() {
  return (
    <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Pipelined P=4 throughput by core count for BlinkDB, DragonflyDB and Redis Tuned" style={{ width: "100%", height: "auto" }}>
      {[0, 250_000, 500_000, 750_000, 1_000_000].map((v) => (
        <g key={v}>
          <line className="grid" x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} />
          <text x={L - 10} y={Y(v) + 4} textAnchor="end">{v === 0 ? "0" : fmtK(v)}</text>
        </g>
      ))}
      {SCALING_P4.cores.map((c, i) => (
        <text key={c} x={X(i)} y={H - 16} textAnchor="middle">{c} cores</text>
      ))}
      {series.map((s) => {
        const pts = s.data.map((v, i) => `${X(i)},${Y(v)}`).join(" ");
        const isBd = s.key === "bd";
        return (
          <g key={s.key}>
            {isBd && <polyline points={`${pts} ${X(2)},${Y(0)} ${X(0)},${Y(0)}`} fill="rgba(255,210,63,.08)" stroke="none" />}
            <polyline points={pts} fill="none" stroke={s.color} strokeWidth={isBd ? 3.5 : 2.5} strokeLinejoin="round" strokeLinecap="round" />
            {s.data.map((v, i) => (
              <g key={i}>
                <circle cx={X(i)} cy={Y(v)} r={isBd ? 5.5 : 4} fill="#06070b" stroke={s.color} strokeWidth={2.5} />
                {isBd && <text className="lbl-bd" x={X(i)} y={Y(v) - 14} textAnchor="middle">{fmtK(v)}</text>}
              </g>
            ))}
          </g>
        );
      })}
      <g transform={`translate(${L + 8}, ${T + 4})`}>
        {series.slice().reverse().map((s, i) => (
          <g key={s.key} transform={`translate(${i * 118}, 0)`}>
            <rect width="12" height="12" rx="3" fill={s.color} />
            <text x="18" y="10.5">{s.name}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
