"use client";
import { useMemo, useState } from "react";
import { ENGINES, TIERS, fmt, pct, type EngineKey } from "@/lib/data";

const ORDER: EngineKey[] = ["bd", "df", "rt", "rd"];

export default function BenchExplorer() {
  const [tierIdx, setTierIdx] = useState(2);
  const [suiteId, setSuiteId] = useState("s3");
  const tier = TIERS[tierIdx];
  const row = useMemo(() => tier.rows.find((r) => r.id === suiteId) ?? tier.rows[0], [tier, suiteId]);
  const max = Math.max(...ORDER.map((k) => row.v[k]));
  const best = ORDER.reduce((a, k) => (row.v[k] > row.v[a] ? k : a), "bd" as EngineKey);

  return (
    <div>
      <div className="seg" role="tablist" aria-label="Core count">
        {TIERS.map((t, i) => (
          <button key={t.key} role="tab" aria-selected={i === tierIdx} className={i === tierIdx ? "on" : ""} onClick={() => setTierIdx(i)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="note" style={{ marginTop: 10 }}>{tier.sub} · server pinned to physical P-cores {tier.cpuset}</div>

      <div className="explorer">
        <div className="suite-list" role="listbox" aria-label="Workload">
          {tier.rows.map((r) => {
            const d = r.v.bd / r.v.df - 1;
            return (
              <button key={r.id} role="option" aria-selected={r.id === suiteId} className={`suite-item ${r.id === suiteId ? "on" : ""}`} onClick={() => setSuiteId(r.id)}>
                <span>
                  <span className="t" style={{ display: "block" }}>{r.title}</span>
                  <span className="s">{r.suite}</span>
                </span>
                <span className={`chip ${d >= 0 ? "good" : "bad"}`} title="BlinkDB vs DragonflyDB">{pct(r.v.bd, r.v.df)}</span>
              </button>
            );
          })}
        </div>

        <div className="card pad-lg explorer-main">
          <h3>{row.title}</h3>
          <p className="d">{row.desc}</p>
          <div className="bars">
            {ORDER.map((k) => (
              <div key={k} className={`bar-row ${k === "bd" ? "hl" : ""}`}>
                <div className="name">{ENGINES[k].name}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill w"
                    style={{
                      width: `${(row.v[k] / max) * 100}%`,
                      background: k === "bd" ? "linear-gradient(90deg,#ffb23d,var(--accent))" : ENGINES[k].color,
                      opacity: k === "bd" ? 1 : 0.75,
                    }}
                  />
                </div>
                <div className="val">{fmt(row.v[k])}</div>
              </div>
            ))}
          </div>
          <div className="legend">
            <span><i style={{ background: "var(--accent)" }} />ops/s, higher is better</span>
            <span>BlinkDB vs DragonflyDB: <b style={{ color: row.v.bd >= row.v.df ? "var(--good)" : "var(--bad)" }}>{pct(row.v.bd, row.v.df)}</b></span>
            <span>vs Redis Default: <b style={{ color: row.v.bd >= row.v.rd ? "var(--good)" : "var(--bad)" }}>{pct(row.v.bd, row.v.rd)}</b></span>
            {best !== "bd" && <span>Fastest here: <b style={{ color: "var(--text)" }}>{ENGINES[best].name}</b></span>}
          </div>
        </div>
      </div>
    </div>
  );
}
