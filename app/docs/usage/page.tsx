import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/CodeBlock";
import { SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: "Usage Guide — Install, Run & Connect",
  description:
    "Run BlinkDB with Docker or build it from source, verify it with redis-cli, connect from Python, Node.js and Go, and look up every CLI parameter.",
  alternates: { canonical: "/docs/usage" },
  openGraph: { title: "BlinkDB Usage Guide", description: "Install, run and connect to BlinkDB in 30 seconds.", url: "/docs/usage" },
};

const DOCKER = `# Pull the official Docker image
docker pull akram6t/blinkdb:latest

# Run on 4 dedicated cores with 8 GB RAM
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
  --data-dir /data`;

const SOURCE = `# Prerequisites: Linux 6.0+, Rust 1.80+
git clone https://github.com/akram6t/blinkdb.git
cd blinkdb
cargo build --release

# Run standalone server
./target/release/blinkdb-server \\
  --resp-port 6379 \\
  --binary-port 7379 \\
  --threads 4 \\
  --max-memory-mb 4096 \\
  --data-dir ./data`;

const VERIFY = `redis-cli -p 6379 PING
# Output: +PONG

redis-cli -p 6379 SET user:101 "John Doe"
# Output: OK

redis-cli -p 6379 GET user:101
# Output: "John Doe"`;

const PY = `import redis

client = redis.Redis(host="127.0.0.1", port=6379, decode_responses=True)

client.set("session:token", "xyz987", ex=1800)
print("Session:", client.get("session:token"))

# Pipelining
pipe = client.pipeline()
for i in range(100):
    pipe.set(f"key:{i}", f"val:{i}")
pipe.execute()`;

const NODE = `import Redis from "ioredis";

const redis = new Redis({ host: "127.0.0.1", port: 6379 });

await redis.set("counter", 10);
await redis.incr("counter");
console.log("Counter:", await redis.get("counter")); // 11`;

const GO = `package main

import (
	"context"
	"fmt"
	"github.com/redis/go-redis/v9"
)

func main() {
	ctx := context.Background()
	rdb := redis.NewClient(&redis.Options{Addr: "127.0.0.1:6379"})

	rdb.Set(ctx, "cluster:status", "operational", 0)
	val, _ := rdb.Get(ctx, "cluster:status").Result()
	fmt.Println("Status:", val)
}`;

const PARAMS = [
  ["-p, --resp-port <PORT>", "6379", "Port for Redis RESP3 / RESP2 client connections"],
  ["-b, --binary-port <PORT>", "7379", "Port for the native binary protocol"],
  ["-t, --threads <COUNT>", "0", "Worker shards (0 = auto-detect all physical cores)"],
  ["-d, --data-dir <PATH>", "./data", "Filesystem path for cold LSM-tree storage and the WAL"],
  ["-m, --max-memory-mb <MB>", "1024", "Hot RAM threshold before cold tiering / eviction"],
  ["--cluster", "false", "Enable distributed Raft clustering mode"],
  ["--node-id <ID>", "1", "Unique node ID in the distributed cluster"],
];

export default function UsagePage() {
  return (
    <>
      <div className="eyebrow">Documentation</div>
      <h1>Usage guide</h1>
      <p className="intro">
        Everything you need to install BlinkDB, run it, and connect to it with the Redis clients you already use.
      </p>

      <h2 id="quickstart">⚡ Quickstart in 30 seconds</h2>
      <p>The recommended way to run BlinkDB is the official Docker image. This example pins the server to four dedicated cores with 8 GB of RAM.</p>
      <CodeBlock code={DOCKER} title="docker" />

      <h3>What the flags do</h3>
      <ul>
        <li><code>--network host</code> exposes the RESP port directly on the host (<code>6379</code> by default).</li>
        <li><code>--security-opt seccomp=unconfined</code> is used because BlinkDB relies on <code>io_uring</code>, which Docker&apos;s default seccomp profile can restrict.</li>
        <li><code>--cpuset-cpus</code> and <code>--threads</code> go together: run one worker shard per dedicated core.</li>
        <li><code>--memory 8g</code> is the container limit; set <code>--max-memory-mb</code> below it so there is headroom for buffers and rings. The example uses 6144 MB.</li>
        <li><code>-v /tmp/blinkdb_data:/data</code> with <code>--data-dir /data</code> persists the cold LSM-tree storage and write-ahead log.</li>
      </ul>
      <div className="callout info">
        <b>Tip:</b> for the best results, pin the server to physical performance cores and keep your load generator on different cores. That is exactly how the{" "}
        <Link href="/docs/benchmarks#method" style={{ color: "var(--accent)" }}>published benchmarks</Link> were run.
      </div>

      <h2 id="build">Building from source</h2>
      <p>You need <b>Linux 6.0+</b> (for io_uring) and <b>Rust 1.80+</b>.</p>
      <CodeBlock code={SOURCE} title="bash" />

      <h2 id="verify">Verify with redis-cli</h2>
      <p>Because BlinkDB speaks RESP, the stock Redis CLI works out of the box.</p>
      <CodeBlock code={VERIFY} title="redis-cli" />

      <h2 id="clients">💻 Client integration examples</h2>
      <p>BlinkDB works with existing Redis libraries without modifications. Pick your language:</p>
      <Tabs
        tabs={[
          { label: "Python (redis-py)", code: PY },
          { label: "Node.js (ioredis)", code: NODE },
          { label: "Go (go-redis)", code: GO },
        ]}
      />
      <p>
        More examples for Rust, Go, Java and the native binary protocol (port <code>7379</code>) live in the{" "}
        <a href={`${SITE.github}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>Client Integration Guide in the repository</a>.
      </p>

      <h2 id="cli">🛠️ CLI parameter reference</h2>
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr><th>Parameter</th><th style={{ textAlign: "left" }}>Default</th><th style={{ textAlign: "left" }}>Description</th></tr>
          </thead>
          <tbody>
            {PARAMS.map(([p, d, desc]) => (
              <tr key={p}>
                <td><code>{p}</code></td>
                <td className="l"><code>{d}</code></td>
                <td className="l" style={{ whiteSpace: "normal" }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Sizing guidance from the benchmarks</h3>
      <ul>
        <li>The published runs used one worker shard per pinned physical core: <code>--threads 2</code>, <code>3</code> and <code>4</code>.</li>
        <li>Memory limits were 4 GB, 6 GB and 8 GB containers with <code>--max-memory-mb</code> of 3584, 5632 and 7680.</li>
        <li>For pipelined workloads BlinkDB peaked at 3 cores in several suites, so more cores is not always better. Benchmark your own workload.</li>
      </ul>

      <div className="prev-next">
        <span />
        <Link href="/docs/benchmarks" style={{ textAlign: "right" }}>
          <small>Next</small>
          <b>Benchmarks &amp; comparison →</b>
        </Link>
      </div>
    </>
  );
}
