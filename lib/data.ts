// All numbers come from the Nov 6, 2026 multi-tier benchmark report
// (median of 5 runs, middle 3 averaged / std dev reported).

export const SITE = {
  name: "BlinkDB",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://blinkdb.dev",
  github: "https://github.com/akram6t/blinkdb",
  docker: "https://hub.docker.com/r/akram6t/blinkdb",
  tagline: "The io_uring-native, Redis-compatible in-memory database.",
  description:
    "BlinkDB is a Rust, io_uring-native in-memory database that speaks the Redis protocol. Up to 1.04M ops/s on 4 cores, 2.29x faster than DragonflyDB on batch reads, and a drop-in for existing Redis clients.",
};

export type EngineKey = "bd" | "df" | "rd" | "rt";

export const ENGINES: Record<EngineKey, { name: string; short: string; color: string }> = {
  bd: { name: "BlinkDB", short: "BlinkDB", color: "var(--accent)" },
  df: { name: "DragonflyDB", short: "Dragonfly", color: "#8b7cff" },
  rd: { name: "Redis 7 Default", short: "Redis", color: "#ff6b6b" },
  rt: { name: "Redis 7 Tuned", short: "Redis Tuned", color: "#5b6478" },
};

export type Row = {
  id: string;
  suite: string;
  title: string;
  desc: string;
  v: Record<EngineKey, number>;
  sd: Record<EngineKey, number>; // std dev in ops/s
};

type Raw = [string, string, string, string, number[], number[]];

const mk = (raw: Raw[]): Row[] =>
  raw.map(([id, suite, title, desc, v, sd]) => ({
    id,
    suite,
    title,
    desc,
    v: { bd: v[0], df: v[1], rd: v[2], rt: v[3] },
    sd: { bd: sd[0], df: sd[1], rd: sd[2], rt: sd[3] },
  }));

export const TIER1: Row[] = mk([
  ["s1", "Suite 1", "Read-heavy web app", "1:10 GET:SET, Gaussian keys, 96 connections", [247437, 195880, 114432, 159727], [17800, 13800, 6100, 8300]],
  ["s2", "Suite 2", "Session store", "1:5, Zipfian hot keys, 96 connections", [244830, 196236, 113000, 165601], [5200, 14300, 4800, 3600]],
  ["s3", "Suite 3", "Client-pool pipelining (P=4)", "1:5, pipeline depth 4, 96 connections", [756425, 414210, 337877, 403225], [32400, 18700, 15200, 80400]],
  ["s4", "Suite 4", "Connection spike (c=496)", "1:5, 496 simultaneous connections", [246274, 142137, 95996, 152020], [41800, 6600, 6900, 6900]],
  ["s5a", "Suite 5", "Ping-pong SET (P=1)", "Random keys, synchronous", [79872, 77399, 91241, 63776], [11600, 16100, 8600, 19400]],
  ["s5b", "Suite 5", "Ping-pong GET (P=1)", "Random keys, synchronous", [91241, 105042, 96899, 98814], [6700, 4100, 8900, 33500]],
  ["s5c", "Suite 5", "Ping-pong INCR (P=1)", "Random keys, synchronous", [87108, 105042, 102881, 107296], [6600, 20300, 11100, 13200]],
  ["s7a", "Suite 7", "Batch ingestion SET (P=16)", "100 connections, pipeline depth 16", [537634, 462963, 375940, 427350], [83800, 74100, 52300, 104700]],
  ["s7b", "Suite 7", "Batch ingestion GET (P=16)", "100 connections, pipeline depth 16", [657895, 641026, 485437, 531915], [94600, 68200, 38900, 163500]],
]);

export const TIER25: Row[] = mk([
  ["s1", "Suite 1", "Read-heavy web app", "1:10 GET:SET, Gaussian keys, 96 connections", [315638, 250204, 117799, 184127], [54300, 23200, 5900, 10300]],
  ["s2", "Suite 2", "Session store", "1:5, Zipfian hot keys, 96 connections", [310742, 238546, 112630, 192740], [65100, 11500, 4200, 21200]],
  ["s3", "Suite 3", "Client-pool pipelining (P=4)", "1:5, pipeline depth 4, 96 connections", [881054, 582146, 365934, 473807], [107600, 37200, 14800, 54100]],
  ["s4", "Suite 4", "Connection spike (c=496)", "1:5, 496 simultaneous connections", [407201, 228183, 95966, 196808], [72900, 14300, 2700, 11500]],
  ["s5a", "Suite 5", "Ping-pong SET (P=1)", "Random keys, synchronous", [81433, 91575, 91241, 36232], [5700, 7800, 4200, 12800]],
  ["s5b", "Suite 5", "Ping-pong GET (P=1)", "Random keys, synchronous", [88968, 96154, 101215, 87719], [4700, 10500, 7500, 26900]],
  ["s5c", "Suite 5", "Ping-pong INCR (P=1)", "Random keys, synchronous", [93284, 104603, 107296, 72254], [5300, 10200, 7100, 18700]],
  ["s7a", "Suite 7", "Batch ingestion SET (P=16)", "100 connections, pipeline depth 16", [588235, 505051, 423729, 396825], [112600, 48700, 29400, 99100]],
  ["s7b", "Suite 7", "Batch ingestion GET (P=16)", "100 connections, pipeline depth 16", [694445, 617284, 495050, 438597], [35300, 52800, 61900, 179400]],
]);

export const TIER2: Row[] = mk([
  ["s1", "Suite 1", "Read-heavy web app", "1:10 GET:SET, Gaussian keys, 96 connections", [279429, 329147, 117320, 212520], [66700, 48600, 5400, 23000]],
  ["s2", "Suite 2", "Session store", "1:5, Zipfian hot keys, 96 connections", [313702, 278608, 114110, 183936], [76300, 30200, 4900, 20800]],
  ["s3", "Suite 3", "Client-pool pipelining (P=4)", "1:5, pipeline depth 4, 96 connections", [843766, 665764, 353443, 530660], [245300, 66800, 16100, 71900]],
  ["s4", "Suite 4", "Connection spike (c=496)", "1:5, 496 simultaneous connections", [320879, 267665, 103219, 216618], [89200, 22300, 6200, 15500]],
  ["s5a", "Suite 5", "Ping-pong SET (P=1)", "Random keys, synchronous", [82782, 80386, 92937, 19826], [4600, 9700, 5000, 9800]],
  ["s5b", "Suite 5", "Ping-pong GET (P=1)", "Random keys, synchronous", [98425, 86505, 103306, 82237], [3300, 3300, 3300, 40000]],
  ["s5c", "Suite 5", "Ping-pong INCR (P=1)", "Random keys, synchronous", [96154, 84746, 108225, 50813], [3000, 6700, 3900, 19400]],
  ["s7a", "Suite 7", "Batch ingestion SET (P=16)", "100 connections, pipeline depth 16", [632911, 467290, 375940, 177936], [206900, 51200, 30300, 75000]],
  ["s7b", "Suite 7", "Batch ingestion GET (P=16)", "100 connections, pipeline depth 16", [1041667, 454545, 403226, 403226], [243500, 55400, 56200, 247900]],
]);

export const TIERS = [
  { key: "t1", label: "2 cores", sub: "Tier 1 · 2 P-cores · 4 GB", cpuset: "0,2", mem: "4g", maxMem: "3584 MB", rows: TIER1 },
  { key: "t25", label: "3 cores", sub: "Tier 2.5 · 3 P-cores · 6 GB", cpuset: "0,2,4", mem: "6g", maxMem: "5632 MB", rows: TIER25 },
  { key: "t2", label: "4 cores", sub: "Tier 2 · 4 P-cores · 8 GB", cpuset: "0,2,4,6", mem: "8g", maxMem: "7680 MB", rows: TIER2 },
] as const;

export type PayloadRow = { size: string; cmd: "SET" | "GET"; v: Record<EngineKey, number> };
const pl = (size: string, cmd: "SET" | "GET", a: number[]): PayloadRow => ({
  size,
  cmd,
  v: { bd: a[0], df: a[1], rd: a[2], rt: a[3] },
});

export const PAYLOAD_T1: PayloadRow[] = [
  pl("256B", "SET", [76142, 84746, 76923, 64655]),
  pl("256B", "GET", [87719, 102041, 105634, 98039]),
  pl("512B", "SET", [77720, 82873, 70094, 36058]),
  pl("512B", "GET", [102740, 104167, 104167, 94937]),
  pl("1024B", "SET", [72464, 90361, 78534, 83799]),
  pl("1024B", "GET", [85714, 100671, 100000, 83799]),
  pl("4096B", "SET", [67265, 58140, 69767, 50167]),
  pl("4096B", "GET", [87719, 86705, 100000, 61984]),
];

export const PAYLOAD_T2: PayloadRow[] = [
  pl("256B", "SET", [81081, 57915, 85227, 42373]),
  pl("256B", "GET", [94340, 82873, 102740, 102740]),
  pl("512B", "SET", [70755, 67873, 74627, 19380]),
  pl("512B", "GET", [97403, 82873, 89286, 86705]),
  pl("1024B", "SET", [70094, 65502, 83333, 15152]),
  pl("1024B", "GET", [85714, 74257, 100671, 72464]),
  pl("4096B", "SET", [71429, 49834, 73892, 13181]),
  pl("4096B", "GET", [89286, 68493, 97403, 20080]),
];

export const MEMORY = [
  { engine: "BlinkDB", tier: "Tier 1", base: 13.8, keys: 48.0, peak: 358.2, flush: 58.0 },
  { engine: "BlinkDB", tier: "Tier 2", base: 5.6, keys: 39.4, peak: 357.1, flush: 124.3 },
  { engine: "DragonflyDB", tier: "Tier 1", base: 28.7, keys: 48.9, peak: 321.2, flush: 44.0 },
  { engine: "DragonflyDB", tier: "Tier 2", base: 32.8, keys: 25.5, peak: 304.4, flush: 23.9 },
  { engine: "Redis 7 Default", tier: "Tier 1", base: 8.6, keys: 16.0, peak: 393.3, flush: 17.4 },
  { engine: "Redis 7 Default", tier: "Tier 2", base: 8.5, keys: 21.6, peak: 392.0, flush: 16.8 },
  { engine: "Redis 7 Tuned", tier: "Tier 2", base: 3.7, keys: 17.1, peak: 394.9, flush: 18.7 },
];

export const MEMORY_BREAKDOWN = [
  { label: "User key-value data", detail: "100,000 keys × ~100 B", mb: 10 },
  { label: "scc::HashMap hash index", detail: "131,072 pre-allocated buckets", mb: 15 },
  { label: "LSM MemTable + Bloom filters", detail: "Active skiplist + 64 KB blooms", mb: 12 },
  { label: "io_uring fixed buffers & rings", detail: "4 shards × 4096 entries", mb: 8 },
];

// Scaling: suite 3 (pipelined P=4) throughput by core count
export const SCALING_P4 = {
  cores: [2, 3, 4],
  bd: [756425, 881054, 843766],
  df: [414210, 582146, 665764],
  rt: [403225, 473807, 530660],
};

export const SCALING_TABLE = [
  { suite: "Suite 1 · Read-heavy", engine: "BlinkDB", t1: 247437, t25: 315638, t2: 279429, net: "+12.9%", eff: "56.5%", status: "Soft plateau" },
  { suite: "Suite 1 · Read-heavy", engine: "DragonflyDB", t1: 195880, t25: 250204, t2: 329147, net: "+68.0%", eff: "84.0%", status: "Linear" },
  { suite: "Suite 1 · Read-heavy", engine: "Redis Tuned", t1: 159727, t25: 184127, t2: 212520, net: "+33.1%", eff: "66.5%", status: "Moderate" },
  { suite: "Suite 2 · Session store", engine: "BlinkDB", t1: 244830, t25: 310742, t2: 313702, net: "+28.1%", eff: "64.1%", status: "Stable #1" },
  { suite: "Suite 2 · Session store", engine: "DragonflyDB", t1: 196236, t25: 238546, t2: 278608, net: "+42.0%", eff: "71.0%", status: "Good" },
  { suite: "Suite 2 · Session store", engine: "Redis Tuned", t1: 165601, t25: 192740, t2: 183936, net: "+11.1%", eff: "55.5%", status: "Contention" },
  { suite: "Suite 3 · Pipelined P=4", engine: "BlinkDB", t1: 756425, t25: 881054, t2: 843766, net: "+11.5%", eff: "55.8%", status: "Peak at 3 cores" },
  { suite: "Suite 3 · Pipelined P=4", engine: "DragonflyDB", t1: 414210, t25: 582146, t2: 665764, net: "+60.7%", eff: "80.4%", status: "Good" },
  { suite: "Suite 3 · Pipelined P=4", engine: "Redis Tuned", t1: 403225, t25: 473807, t2: 530660, net: "+31.6%", eff: "65.8%", status: "Moderate" },
  { suite: "Suite 4 · Spike c=496", engine: "BlinkDB", t1: 246274, t25: 407201, t2: 320879, net: "+30.3%", eff: "65.1%", status: "Peak at 3 cores" },
  { suite: "Suite 4 · Spike c=496", engine: "DragonflyDB", t1: 142137, t25: 228183, t2: 267665, net: "+88.3%", eff: "94.2%", status: "Near-linear" },
  { suite: "Suite 4 · Spike c=496", engine: "Redis Tuned", t1: 152020, t25: 196808, t2: 216618, net: "+42.5%", eff: "71.2%", status: "Moderate" },
];

export const LIMITATIONS = [
  {
    title: "Pipelined throughput plateaus around 840k–880k ops/s",
    body: "PMU counters show the DDR5 bus is nowhere near saturated (under 2 GB/s measured vs 76.8 GB/s peak). The plateau at 4 cores comes from inter-core ring-buffer polling arbitration, and BlinkDB peaks at 3 cores on several suites.",
  },
  {
    title: "Synchronous ping-pong (P=1) favours single-threaded Redis",
    body: "A dedicated-core Redis 7 leads SET by roughly 10–12% (~0.25 ms vs ~0.29 ms) because it has zero inter-thread synchronisation. BlinkDB's advantage appears with pipelining (P ≥ 4) or many connections (c ≥ 96).",
  },
  {
    title: "Small payloads on 2 cores favour DragonflyDB",
    body: "At 256B–1KB on Tier 1, DragonflyDB leads by 4–15% thanks to fiber-scheduler cache locality. BlinkDB's per-shard design needs 3+ cores to amortise its lock-free indexing overhead.",
  },
  {
    title: "Higher baseline memory than Redis",
    body: "At 100k keys BlinkDB uses ~39–48 MiB RSS vs Redis 7's 16–21 MiB. The ~25 MiB difference is io_uring ring buffers (~8 MB), the LSM MemTable and Bloom filters (~12 MB) and pre-allocated hash buckets (~15 MB).",
  },
];

export const fmt = (n: number) => n.toLocaleString("en-US");
export const fmtK = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : `${Math.round(n / 1000)}k`;
export const pct = (a: number, b: number) => {
  const p = (a / b - 1) * 100;
  return `${p >= 0 ? "+" : "−"}${Math.abs(p).toFixed(1)}%`;
};
