import Link from "next/link";
import { Bolt } from "@/components/Nav";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";
import { InstallCmd, Tabs } from "@/components/CodeBlock";
import PipelineChart from "@/components/PipelineChart";
import BenchExplorer from "@/components/BenchExplorer";
import ScalingChart from "@/components/ScalingChart";
import { SITE, TIER1, TIER2, TIER25, pct, fmt } from "@/lib/data";

const get = (rows: typeof TIER1, id: string) => rows.find((r) => r.id === id)!;

const WINS = [
  { id: "s3", title: "Pipelined workloads", desc: "Client pools with pipeline depth 4" },
  { id: "s2", title: "Session stores", desc: "Zipfian hot keys, 1:5 read/write" },
  { id: "s4", title: "Connection spikes", desc: "496 simultaneous connections" },
  { id: "s7a", title: "Batch ingestion", desc: "Pipeline depth 16, SET" },
];

const FEATURES = [
  {
    t: "io_uring-native I/O",
    d: "Per-thread monoio event loops submit I/O straight to the kernel, with registered buffers and rings instead of epoll round-trips.",
    i: <path d="M13.5 2 4 13.5h6.2L9.5 22 20 9.8h-6.4L13.5 2Z" />,
  },
  {
    t: "Shard-per-core engine",
    d: "Each worker shard owns a slice of the keyspace behind a lock-free hash index, so Zipfian hot keys don't pile up on a global lock.",
    i: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  },
  {
    t: "Redis-compatible",
    d: "Speaks RESP2 and RESP3 on port 6379. redis-py, ioredis and go-redis connect without modification.",
    i: <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.6 3.7L12 11.7 5.4 8 12 4.3ZM5 9.7l6 3.4v6.6l-6-3.4V9.7Zm8 10V13l6-3.3v6.6l-6 3.4Z" />,
  },
  {
    t: "Tiered hot/cold storage",
    d: "Keep hot data in RAM up to --max-memory-mb, then tier cold data to an LSM-tree with a write-ahead log on disk.",
    i: <path d="M12 3C7 3 4 4.6 4 6.5v11C4 19.4 7 21 12 21s8-1.6 8-3.5v-11C20 4.6 17 3 12 3Zm0 2c3.9 0 6 .9 6 1.5S15.9 8 12 8 6 7.1 6 6.5 8.1 5 12 5Zm0 14c-3.9 0-6-.9-6-1.5v-2.2c1.5.8 3.7 1.2 6 1.2s4.5-.4 6-1.2v2.2c0 .6-2.1 1.5-6 1.5Zm0-5c-3.9 0-6-.9-6-1.5V10.3c1.5.8 3.7 1.2 6 1.2s4.5-.4 6-1.2V12.5c0 .6-2.1 1.5-6 1.5Z" />,
  },
  {
    t: "Native binary protocol",
    d: "A dedicated binary port (7379) alongside RESP, for clients that want to skip text parsing entirely.",
    i: <path d="M4 5h2v2H4zM8 5h2v2H8zM4 9h6v2H4zM14 5h6v2h-6zM14 9h6v2h-6zM4 13h2v2H4zM8 13h2v2H8zM14 13h6v2h-6zM4 17h6v2H4zM14 17h2v2h-2z" />,
  },
  {
    t: "Distributed with Raft",
    d: "Turn on --cluster and give each node an --node-id to run BlinkDB as a Raft-replicated cluster.",
    i: <path d="M12 3a3 3 0 0 1 .9 5.9v2.6l4.6 2.6a3 3 0 1 1-1 1.7L12 13.2l-4.5 2.6a3 3 0 1 1-1-1.7l4.6-2.6V8.9A3 3 0 0 1 12 3Z" />,
  },
];

const QUICK = [
  {
    label: "Docker",
    code: `docker pull akram6t/blinkdb:latest

docker run -d \\
  --name blinkdb \\
  --network host \\
  --security-opt seccomp=unconfined \\
  --cpuset-cpus "0,2,4,6" \\
  --memory 8g \\
  -v /tmp/blinkdb_data:/data \\
  akram6t/blinkdb:latest \\
  --threads 4 \\
  --resp-port 6379 \\
  --max-memory-mb 6144 \\
  --data-dir /data`,
  },
  {
    label: "From source",
    code: `# Prerequisites: Linux 6.0+, Rust 1.80+
git clone https://github.com/akram6t/blinkdb.git
cd blinkdb
cargo build --release

./target/release/blinkdb-server \\
  --resp-port 6379 \\
  --binary-port 7379 \\
  --threads 4 \\
  --max-memory-mb 4096 \\
  --data-dir ./data`,
  },
  {
    label: "redis-cli",
    code: `redis-cli -p 6379 PING
# +PONG

redis-cli -p 6379 SET user:101 "John Doe"
# OK

redis-cli -p 6379 GET user:101
# "John Doe"`,
  },
];

export default function Home() {
  const peak = get(TIER2, "s7b");
  const spike3 = get(TIER25, "s4");
  const p4t1 = get(TIER1, "s3");

  return (
    <>
      {/* HERO */}
      <section className="section hero">
        <div className="grid-bg" />
        <div className="wrap hero-in">
          <span className="badge"><span className="dot" /> Open source · Redis-compatible · Built on io_uring</span>
          <h1>
            Databases at the speed of a <span className="grad">blink.</span>
          </h1>
          <p className="sub">
            BlinkDB is an in-memory database written in Rust that speaks the Redis protocol. Point your existing client at it and
            get up to <b style={{ color: "var(--text)" }}>1.04 million ops/s on four cores</b>.
          </p>
          <div className="cta-row">
            <Link href="/docs/usage" className="btn primary"><Bolt size={16} /> Get started</Link>
            <Link href="/docs/benchmarks" className="btn">Read the benchmarks</Link>
            <a href={SITE.github} className="btn" target="_blank" rel="noopener noreferrer">Star on GitHub</a>
          </div>
          <InstallCmd cmd="docker pull akram6t/blinkdb:latest" />

          <div className="stats">
            <div className="stat">
              <div className="num grad"><CountUp to={peak.v.bd / 1_000_000} decimals={2} suffix="M" /></div>
              <div className="lbl">ops/s peak</div>
              <div className="sub">Batch GET, P=16, 4 cores</div>
            </div>
            <div className="stat">
              <div className="num grad"><CountUp to={peak.v.bd / peak.v.df} decimals={2} suffix="×" /></div>
              <div className="lbl">faster than DragonflyDB</div>
              <div className="sub">Same workload, same 4 cores</div>
            </div>
            <div className="stat">
              <div className="num grad"><CountUp to={(p4t1.v.bd / p4t1.v.df - 1) * 100} decimals={1} prefix="+" suffix="%" /></div>
              <div className="lbl">pipelined vs DragonflyDB</div>
              <div className="sub">P=4 client pool, 2 cores</div>
            </div>
            <div className="stat">
              <div className="num grad"><CountUp to={spike3.v.bd / spike3.v.rd} decimals={1} suffix="×" /></div>
              <div className="lbl">Redis 7 under a spike</div>
              <div className="sub">496 connections, 3 cores</div>
            </div>
          </div>
          <p className="note" style={{ marginTop: 14 }}>
            Median of 5 runs · memtier_benchmark &amp; redis-benchmark · Docker-pinned physical cores ·{" "}
            <Link href="/docs/benchmarks" style={{ textDecoration: "underline" }}>full methodology</Link>
          </p>
        </div>
      </section>

      {/* LEADERBOARD */}
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="wrap grid2" style={{ alignItems: "center", gap: 48 }}>
          <div>
            <div className="eyebrow">Throughput</div>
            <h2 className="title">The pipelined throughput leader.</h2>
            <p className="lead">
              With pipelined client pools (P=4), BlinkDB on <b style={{ color: "var(--text)" }}>just 2 cores</b> already outruns
              DragonflyDB on 4, and it peaks at {fmt(881054)} ops/s on 3.
            </p>
            <p className="note" style={{ marginTop: 18 }}>Operations per second · Suite 3 · 1:5 read/write · 96 connections</p>
          </div>
          <div className="card pad-lg">
            <PipelineChart />
          </div>
        </div>
      </section>

      {/* EXPLORER */}
      <section className="section" style={{ background: "var(--bg2)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="eyebrow">Interactive benchmarks</div>
          <h2 className="title">Pick a core count. Pick a workload.</h2>
          <p className="lead">Every number below is a median of five runs. Switch tiers to see how each engine behaves as cores are added.</p>
          <div style={{ marginTop: 32 }}>
            <BenchExplorer />
          </div>
        </div>
      </section>

      {/* WINS */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">Where BlinkDB wins</div>
          <h2 className="title">Ahead of DragonflyDB on the workloads that matter.</h2>
          <p className="lead">Pipelined pools, hot-key session stores, connection storms and bulk ingestion. Lead over DragonflyDB at 2 and 4 cores:</p>
          <div className="grid2" style={{ marginTop: 36, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
            {WINS.map((w) => {
              const a = get(TIER1, w.id), b = get(TIER2, w.id);
              return (
                <Reveal key={w.id} className="card win feature">
                  <h3>{w.title}</h3>
                  <div className="k">{w.desc}</div>
                  <div className="row"><span>2 cores</span><b style={{ color: "var(--good)" }}>{pct(a.v.bd, a.v.df)}</b></div>
                  <div className="row"><span>4 cores</span><b style={{ color: "var(--good)" }}>{pct(b.v.bd, b.v.df)}</b></div>
                  <div className="row"><span>4-core ops/s</span><span style={{ fontFamily: "var(--mono)" }}>{fmt(b.v.bd)}</span></div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* SCALING */}
      <section className="section" style={{ background: "var(--bg2)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap grid2" style={{ alignItems: "center", gap: 48 }}>
          <div className="card pad-lg"><ScalingChart /></div>
          <div>
            <div className="eyebrow">Efficiency</div>
            <h2 className="title">More throughput from fewer cores.</h2>
            <p className="lead">
              BlinkDB reaches most of its pipelined throughput by 3 cores. That makes small instances unusually cost-effective:
              the 2-core result beats DragonflyDB&apos;s 4-core result.
            </p>
            <p className="lead" style={{ fontSize: 15 }}>
              Honest note: scaling flattens past 3 cores while DragonflyDB keeps scaling closer to linearly.
              <Link href="/docs/benchmarks#scaling" style={{ color: "var(--accent)" }}> See the analysis →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">Architecture</div>
          <h2 className="title">Built for modern Linux.</h2>
          <p className="lead">A kernel-native I/O path, a shard-per-core engine, and storage that goes beyond RAM.</p>
          <div className="grid3" style={{ marginTop: 40 }}>
            {FEATURES.map((f) => (
              <div key={f.t} className="card feature">
                <div className="ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{f.i}</svg>
                </div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICKSTART */}
      <section className="section" style={{ background: "var(--bg2)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap grid2" style={{ alignItems: "center", gap: 48 }}>
          <div>
            <div className="eyebrow">Quickstart</div>
            <h2 className="title">Running in 30 seconds.</h2>
            <p className="lead">
              Pull the image, pin it to dedicated cores, and talk to it with the Redis tooling you already have. No client changes.
            </p>
            <div className="cta-row" style={{ justifyContent: "flex-start" }}>
              <Link href="/docs/usage" className="btn primary">Full usage guide</Link>
              <a href={SITE.docker} className="btn" target="_blank" rel="noopener noreferrer">Docker Hub</a>
            </div>
          </div>
          <Tabs tabs={QUICK} />
        </div>
      </section>

      {/* HONEST */}
      <section className="section">
        <div className="wrap">
          <div className="honest">
            <div className="eyebrow">Straight talk</div>
            <h2 className="title" style={{ fontSize: "clamp(26px,3.6vw,38px)" }}>Where BlinkDB isn&apos;t the fastest.</h2>
            <p className="lead">Benchmarks you can trust show the losses too. Here&apos;s what the data says.</p>
            <ul>
              <li><span className="m">▸</span><span><b>Synchronous ping-pong (P=1).</b> A single-threaded Redis 7 on a dedicated core leads SET by roughly 10–14%. BlinkDB&apos;s edge shows up when you pipeline or add connections.</span></li>
              <li><span className="m">▸</span><span><b>Small payloads on 2 cores.</b> DragonflyDB is ahead at 256B–1KB on Tier 1; BlinkDB overtakes it at every payload size from 4 cores.</span></li>
              <li><span className="m">▸</span><span><b>Memory footprint.</b> ~39–48 MiB at 100k keys vs 16–22 MiB for Redis, the price of io_uring rings, LSM structures and pre-allocated indexes.</span></li>
            </ul>
            <div style={{ marginTop: 28 }}>
              <Link href="/docs/benchmarks#limits" className="btn">Read all limitations</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta">
            <h2 className="title">Blink, and it&apos;s <span className="grad">done.</span></h2>
            <p className="lead" style={{ margin: "16px auto 0" }}>Swap the port, keep your code. Try BlinkDB on your own workload.</p>
            <div className="cta-row">
              <Link href="/docs/usage" className="btn primary"><Bolt size={16} /> Read the docs</Link>
              <a href={SITE.github} className="btn" target="_blank" rel="noopener noreferrer">View on GitHub</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
