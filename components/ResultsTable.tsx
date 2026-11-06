import { ENGINES, fmt, pct, type EngineKey, type PayloadRow, type Row } from "@/lib/data";

const KEYS: EngineKey[] = ["bd", "df", "rd", "rt"];

function Delta({ a, b }: { a: number; b: number }) {
  const up = a >= b;
  return <td className={up ? "pos" : "neg"}>{pct(a, b)}</td>;
}

export function ResultsTable({ rows, rtLabel }: { rows: Row[]; rtLabel: string }) {
  return (
    <div className="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th>Workload</th>
            <th>BlinkDB</th>
            <th>DragonflyDB</th>
            <th>Redis Default</th>
            <th>{rtLabel}</th>
            <th>vs Dragonfly</th>
            <th>vs Redis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const best = KEYS.reduce((a, k) => (r.v[k] > r.v[a] ? k : a), "bd" as EngineKey);
            return (
              <tr key={r.id}>
                <td>
                  <b>{r.suite}</b> · {r.title}
                </td>
                {(["bd", "df", "rd", "rt"] as EngineKey[]).map((k) => (
                  <td key={k} className={k === best ? "best" : ""}>
                    {fmt(r.v[k])}
                    <span className="sd">±{(r.sd[k] / 1000).toFixed(1)}k</span>
                  </td>
                ))}
                <Delta a={r.v.bd} b={r.v.df} />
                <Delta a={r.v.bd} b={r.v.rd} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PayloadTable({ rows }: { rows: PayloadRow[] }) {
  return (
    <div className="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th>Payload</th>
            <th>BlinkDB</th>
            <th>DragonflyDB</th>
            <th>Redis Default</th>
            <th>Redis Tuned</th>
            <th>Winner</th>
            <th>BlinkDB vs Dragonfly</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const best = KEYS.reduce((a, k) => (r.v[k] > r.v[a] ? k : a), "bd" as EngineKey);
            const tie = KEYS.filter((k) => r.v[k] === r.v[best]).length > 1;
            return (
              <tr key={r.size + r.cmd}>
                <td><b>{r.size}</b> · {r.cmd}</td>
                {KEYS.map((k) => (
                  <td key={k} className={k === best ? "best" : ""}>{fmt(r.v[k])}</td>
                ))}
                <td className="l" style={{ textAlign: "right" }}>{tie ? "Tie" : ENGINES[best].short}</td>
                <Delta a={r.v.bd} b={r.v.df} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
