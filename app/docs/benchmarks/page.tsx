import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import PipelineChart from "@/components/PipelineChart";
import ScalingChart from "@/components/ScalingChart";
import { PayloadTable, ResultsTable } from "@/components/ResultsTable";
import {
  LIMITATIONS, MEMORY, MEMORY_BREAKDOWN, PAYLOAD_T1, PAYLOAD_T2, SCALING_TABLE, TIERS, fmt,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Benchmarks — BlinkDB vs DragonflyDB vs Redis 7",
  description:
    "Multi-tier production benchmark of BlinkDB against DragonflyDB and Redis 7 (default and tuned): 3 core tiers, 7 workload suites, median of 5 runs with standard deviation.",
  alternates: { canonical: "/docs/benchmarks" },
  openGraph: {
    title: "BlinkDB Benchmarks: vs DragonflyDB & Redis 7",
    description: "Detailed analysis across 2, 3 and 4 cores, including limitations.",
    url: "/docs/benchmarks",
  },
};

const HARDWARE = [
  ["Processor", "13th Gen Intel Core i5-1340P", "2 dedicated P-cores", "3 dedicated P-cores", "4 dedicated P-cores"],
  ["Server cpuset-cpus", "12 cores / 16 threads", "0,2", "0,2,4", "0,2,4,6"],
  ["Container memory", "16 GB DDR5-4800", "4g", "6g", "8g"],
  ["Server max-memory", "n/a", "3584 MB", "5632 MB", "7680 MB"],
  ["Client pinning", "Physical E-cores 8–15", "taskset -c 8-15", "taskset -c 8-15", "taskset -c 8-15"],
  ["Client tools", "memtier & redis-benchmark", "8 worker threads", "8 worker threads", "8 worker threads"],
  ["Storage", "NVMe PCIe Gen4 SSD", "Local NVMe", "Local NVMe", "Local NVMe"],
];

const SCORECARD = [
  ["Pipelined throughput (P=4)", "BlinkDB (+82.6%)", "BlinkDB (+26.7%)", "good", "#1 in both tiers"],
  ["Active session store (Zipfian)", "BlinkDB (+24.8%)", "BlinkDB (+12.6%)", "good", "#1 in both tiers"],
  ["Concurrency burst (c=496)", "BlinkDB (+73.3%)", "BlinkDB (+19.9%)", "good", "#1 in both tiers"],
  ["Batch ingestion (P=16)", "BlinkDB (+16.1%)", "BlinkDB (+129.2% on GET)", "good", "#1 in both tiers"],
  ["Read-heavy web (1:10)", "BlinkDB (+26.3%)", "DragonflyDB (+17.8%)", "mixed", "#1 on 2 cores, #2 on 4 cores"],
  ["Ping-pong latency (P=1 SET)", "Redis Default (+14.2%)", "Redis Default (+12.3%)", "mixed", "#2–3; single-threaded Redis leads"],
  ["Payload sweep (256B–1KB)", "DragonflyDB leads most", "BlinkDB leads vs Dragonfly", "mixed", "Crossover between 2 and 4 cores"],
  ["Payload sweep (4KB)", "Redis Default (+3.7% SET)", "BlinkDB (+43.3% vs Dragonfly)", "good", "Strong on 4 cores"],
  ["Memory (100k keys)", "Redis Default (16.0 MiB)", "Redis Default (21.6 MiB)", "mixed", "Redis #1; BlinkDB 39–48 MiB"],
];

const HYPOTHESES = [
  ["1.1 · Memory bandwidth", "DRAM bandwidth measured via uncore_imc was 1.93 GB/s (Tier 1) and 1.90 GB/s (Tier 2), under 3% of DDR5 bus capacity. Bandwidth saturation was disproven."],
  ["1.2 · False sharing", "Measured xsnp_hitm was 122/s (Tier 1) and 185/s (Tier 2), well below the 500/s alert threshold. Resolved via CacheAligned metrics."],
  ["1.3 · CPU pinning", "Verified through cpuset.cpus.effective and per-thread psr that all worker threads stay on physical performance cores without SMT sibling interference."],
  ["1.5 · Client saturation", "Expanding client workers from 4 to 8 threads on physical E-cores resolved client-side bottlenecks."],
];

export default function BenchmarksPage() {
  return (
    <>
      <div className="eyebrow">Documentation</div>
      <h1>Benchmarks &amp; comparison</h1>
      <p className="intro">
        A multi-tier production benchmark of BlinkDB against DragonflyDB and Redis 7 (default and tuned), measured on
        November 6, 2026. Three hardware tiers, four engines, seven workload suites, five runs each.
      </p>

      <div className="mini-stats">
        <div className="mini"><div className="n">{fmt(1041667)}</div><div className="l">peak ops/s (batch GET, 4 cores)</div></div>
        <div className="mini"><div className="n">2.29×</div><div className="l">vs DragonflyDB, same workload</div></div>
        <div className="mini"><div className="n">+82.6%</div><div className="l">pipelined P=4 vs DragonflyDB, 2 cores</div></div>
        <div className="mini"><div className="n">+210.9%</div><div className="l">vs Redis 7, c=496 spike, 4 cores</div></div>
      </div>

      {/* SUMMARY */}
      <h2 id="summary">Executive summary</h2>
      <p>
        BlinkDB leads high-throughput pipelined workloads (P ≥ 4), active session stores with Zipfian hot keys, and extreme concurrency
        spikes (c ≈ 500) across all core tiers, under strict Docker CPU and memory cgroup constraints. It trails DragonflyDB on small
        payloads at 2 cores, then overtakes it at 4 cores. Single-threaded Redis 7 stays competitive at synchronous P=1 ping-pong
        (leading SET by 10–14%) and has the smallest memory footprint.
      </p>

      <h3>Peak pipelined throughput (P=4)</h3>
      <div className="card" style={{ margin: "16px 0" }}><PipelineChart /></div>

      <h3>Key findings</h3>
      <ol>
        <li>
          <b>Pipelined workloads (P=4 and P=16).</b> At P=4, BlinkDB reaches <code>756,425</code> ops/s on 2 cores (+82.6% over Dragonfly, +123.9% over Redis)
          and <code>843,766</code> on 4 cores (+26.7%, +138.7%). In P=16 batch ingestion it reaches <code>1,041,667</code> ops/s on GET, beating DragonflyDB&apos;s
          454,545 by <b>2.29×</b>.
        </li>
        <li>
          <b>Active session store (Zipfian, 1:5).</b> Leads at every core count: <code>244,830</code> ops/s on 2 cores (+24.8% over Dragonfly),
          <code> 310,742</code> on 3 (+30.3%) and <code>313,702</code> on 4 (+12.6%).
        </li>
        <li>
          <b>Concurrency spike (c=496).</b> <code>246,274</code> ops/s on 2 cores (+73.3% over Dragonfly, +156.5% over Redis) and <code>320,879</code> on 4
          cores (+19.9%, +210.9%). The 3-core run hit <code>407,201</code> (+78.5%, +324.3%).
        </li>
        <li>
          <b>Synchronous ping-pong (P=1).</b> Single-threaded Redis 7 on a dedicated core leads SET at 91.2k–92.9k req/s versus BlinkDB&apos;s 79.9k–82.8k and Dragonfly&apos;s 77.4k–80.4k.
          Redis 7 with io-threads enabled performs far worse here, down to 19.8k req/s at 4 threads.
        </li>
        <li>
          <b>Payload crossover.</b> DragonflyDB is ahead at small payloads on 2 cores. On 4 cores BlinkDB leads DragonflyDB at all
          payload sizes (256B to 4KB), by up to +43.3% on 4KB SET.
        </li>
      </ol>

      <h3>Scorecard</h3>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Dimension</th><th>2 cores</th><th>4 cores</th><th style={{ textAlign: "left" }}>BlinkDB status</th></tr></thead>
          <tbody>
            {SCORECARD.map(([dim, a, b, kind, status]) => (
              <tr key={dim}>
                <td><b>{dim}</b></td>
                <td>{a}</td>
                <td>{b}</td>
                <td className="l" style={{ color: kind === "good" ? "var(--good)" : "var(--accent)" }}>{kind === "good" ? "✓" : "◐"} {status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* METHOD */}
      <h2 id="method">Methodology &amp; hardware</h2>
      <p>
        Every figure is the <b>median of 5 independent runs</b> (highest and lowest dropped, middle three kept), with standard deviation reported.
        Load was generated with <code>redislabs/memtier_benchmark:latest</code> and <code>redis-benchmark</code> from <code>redis:7-alpine</code>.
        All engines ran in Docker with identical CPU and memory cgroup limits.
      </p>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Parameter</th><th>Host</th><th>Tier 1 · 2 cores</th><th>Tier 2.5 · 3 cores</th><th>Tier 2 · 4 cores</th></tr></thead>
          <tbody>
            {HARDWARE.map((r) => (
              <tr key={r[0]}>
                <td><b>{r[0]}</b></td>
                {r.slice(1).map((c, i) => <td key={i}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="callout">
        <b>Strict physical isolation.</b> Client processes were confined to physical Efficiency cores (CPUs 8–15) with <code>taskset</code>, so they never
        compete with the databases on Performance cores (0, 2, 4, 6). SMT siblings (1, 3, 5, 7) were left unallocated to remove hyperthread interference.
      </div>

      {/* RESULTS */}
      <h2 id="results">Results by tier</h2>
      <p>
        Higher is better; the best engine per row is highlighted. Percentages are BlinkDB relative to DragonflyDB and to Redis 7 Default.
        Workloads: Suite 1 (1:10 read-heavy, Gaussian keys), Suite 2 (1:5 session store, Zipfian), Suite 3 (P=4 client pool), Suite 4 (c=496 spike),
        Suite 5 (P=1 random-key ping-pong), Suite 7 (P=16 batch ingestion, c=100).
      </p>
      {TIERS.map((t, i) => (
        <div key={t.key}>
          <h3>{t.sub}</h3>
          <p className="note"><code>--cpuset-cpus {t.cpuset} --memory {t.mem}</code> · Redis Tuned uses <code>io-threads={i + 2}</code></p>
          <ResultsTable rows={t.rows} rtLabel={`Redis Tuned (${i + 2} threads)`} />
        </div>
      ))}

      {/* PAYLOAD */}
      <h2 id="payload">Suite 6: payload sweep</h2>
      <p>
        100,000-key keyspace, 50 connections, values from 256B to 4096B. The sweep shows a clear crossover between 2 and 4 cores.
      </p>
      <h3>2 cores</h3>
      <p>
        DragonflyDB leads outright on four of eight cells (all three small-payload SETs and 1KB GET) and ties for first on 512B GET;
        Redis Default leads 256B GET and both 4KB cells. BlinkDB&apos;s per-shard design needs more cores to amortise its indexing overhead.
      </p>
      <PayloadTable rows={PAYLOAD_T1} />
      <h3>4 cores</h3>
      <p>
        BlinkDB overtakes DragonflyDB at <b>every</b> payload size: +4.2% to +43.3% on SET and +13.8% to +30.4% on GET. Single-threaded Redis stays ahead on most cells in absolute terms.
      </p>
      <PayloadTable rows={PAYLOAD_T2} />

      {/* SCALING */}
      <h2 id="scaling">Vertical scaling</h2>
      <p>
        Scaling efficiency is <code>(T₂ / T₁) / (N₂ / N₁)</code> with N₁ = 2 and N₂ = 4 cores (a 2.0× core factor).
      </p>
      <div className="card" style={{ margin: "18px 0" }}>
        <b style={{ display: "block", marginBottom: 10 }}>Pipelined (P=4) throughput by core count</b>
        <ScalingChart />
      </div>
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr><th>Suite</th><th>Engine</th><th>2 cores</th><th>3 cores</th><th>4 cores</th><th>Net 2→4</th><th>Efficiency</th><th>Status</th></tr>
          </thead>
          <tbody>
            {SCALING_TABLE.map((r) => (
              <tr key={r.suite + r.engine}>
                <td className="l">{r.suite}</td>
                <td className={r.engine === "BlinkDB" ? "best" : ""} style={{ textAlign: "left" }}>{r.engine}</td>
                <td>{fmt(r.t1)}</td><td>{fmt(r.t25)}</td><td>{fmt(r.t2)}</td>
                <td>{r.net}</td><td>{r.eff}</td><td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>Why BlinkDB plateaus at 4 cores</h3>
      <ol>
        <li>BlinkDB peaks at <b>3 cores</b> on Suite 1 (315,638), Suite 3 (881,054) and Suite 4 (407,201).</li>
        <li>Going from 3 to 4 cores adds inter-core ring-buffer polling arbitration across the four performance cores sharing the i5-1340P&apos;s 12 MB L3 cache.</li>
        <li>DragonflyDB scales closer to linearly from 2 to 4 cores on Suite 1 (+68.0%), which the report attributes to its lightweight fibers having lower context-switch cost than BlinkDB&apos;s per-thread monoio event loops at light CPU utilisation.</li>
      </ol>
      <div className="callout info">
        <b>Takeaway:</b> BlinkDB delivers most of its throughput on 2–3 cores. If you have a 2-core budget, it beat DragonflyDB&apos;s 4-core P=4 result.
      </div>

      {/* MEMORY */}
      <h2 id="memory">Memory footprint</h2>
      <p>Measured with <code>docker stats --no-stream</code> at three milestones (MiB).</p>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Engine</th><th>Clean baseline</th><th>100k keys</th><th>After 4KB sweep (peak)</th><th>Post-flush</th></tr></thead>
          <tbody>
            {MEMORY.map((m) => (
              <tr key={m.engine + m.tier}>
                <td><b>{m.engine}</b> <span className="note">({m.tier})</span></td>
                <td>{m.base}</td><td>{m.keys}</td><td>{m.peak}</td><td>{m.flush}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>Where BlinkDB&apos;s ~40–48 MiB at 100k keys goes</h3>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Component</th><th style={{ textAlign: "left" }}>Detail</th><th>≈ MB</th></tr></thead>
          <tbody>
            {MEMORY_BREAKDOWN.map((m) => (
              <tr key={m.label}><td>{m.label}</td><td className="l">{m.detail}</td><td>{m.mb}</td></tr>
            ))}
            <tr><td><b>Total</b></td><td className="l">Matches observed 39.4–48.0 MiB</td><td><b>~45</b></td></tr>
          </tbody>
        </table>
      </div>

      {/* LIMITS */}
      <h2 id="limits">Known limitations</h2>
      <p>No engine wins everywhere. These are the cases where BlinkDB is not the best choice, as documented in the benchmark report.</p>
      <div style={{ display: "grid", gap: 12, margin: "18px 0" }}>
        {LIMITATIONS.map((l, i) => (
          <div key={l.title} className="callout warn" style={{ margin: 0 }}>
            <b>{i + 1}. {l.title}</b>
            <div style={{ marginTop: 6 }}>{l.body}</div>
          </div>
        ))}
      </div>

      <h3>Diagnostic hypotheses</h3>
      <ul>
        {HYPOTHESES.map(([h, d]) => (
          <li key={h}><b>{h}.</b> {d}</li>
        ))}
      </ul>

      {/* REPRODUCE */}
      <h2 id="reproduce">Reproduce the results</h2>
      <p>
        The benchmark harness is in the repository. It pins the server to P-cores and the client to E-cores, and writes machine-readable output
        to <code>results/final_benchmark_results.json</code>. System-noise logs (<code>vmstat_*.log</code>, <code>sar_*.log</code>) are captured per engine and tier in <code>results/</code>.
      </p>
      <CodeBlock
        title="bash"
        code={`# 1. Ensure the Docker daemon is running
# 2. Run the harness (server on P-cores, client on E-cores)
./bench/run_final_benchmarks.sh --tier all --runs 5`}
      />
      <p className="note">Results are specific to the hardware above (i5-1340P, Linux 6.17, Docker-constrained). Your numbers will differ, so test your own workload.</p>

      <div className="prev-next">
        <Link href="/docs/usage">
          <small>Previous</small>
          <b>← Usage guide</b>
        </Link>
        <span />
      </div>
    </>
  );
}
