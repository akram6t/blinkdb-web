import Reveal from "./Reveal";
import { fmt } from "@/lib/data";

// Peak pipelined (P=4) throughput leaderboard, straight from the report's executive summary.
const ROWS = [
  { name: "BlinkDB · 3 cores", v: 881054, color: "var(--accent)", hl: true },
  { name: "BlinkDB · 4 cores", v: 843766, color: "var(--accent)", hl: true },
  { name: "BlinkDB · 2 cores", v: 756425, color: "var(--accent)", hl: true },
  { name: "DragonflyDB · 4 cores", v: 665764, color: "#8b7cff", hl: false },
  { name: "Redis Tuned · 4 cores", v: 530660, color: "#5b6478", hl: false },
  { name: "Redis Default · 1 core", v: 353443, color: "#ff6b6b", hl: false },
];

export default function PipelineChart() {
  const max = Math.max(...ROWS.map((r) => r.v));
  return (
    <Reveal>
      <div className="bars" role="img" aria-label="Pipelined P=4 throughput in operations per second, BlinkDB versus DragonflyDB and Redis">
        {ROWS.map((r) => (
          <div key={r.name} className={`bar-row ${r.hl ? "hl" : ""}`}>
            <div className="name">{r.name}</div>
            <div className="bar-track">
              <div className="bar-fill grow" style={{ width: `${(r.v / max) * 100}%`, background: r.hl ? "linear-gradient(90deg,#ffb23d,var(--accent))" : r.color, opacity: r.hl ? 1 : 0.75 }} />
            </div>
            <div className="val">{fmt(r.v)}</div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
