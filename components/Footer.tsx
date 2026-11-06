import Link from "next/link";
import { SITE } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <div>
          <b style={{ color: "var(--text)" }}>BlinkDB</b>
          <div style={{ marginTop: 6, maxWidth: 380 }}>
            An io_uring-native, Redis-compatible in-memory database written in Rust.
          </div>
          <div style={{ marginTop: 14 }}>© 2026 BlinkDB. Benchmarks measured on November 6, 2026.</div>
        </div>
        <div className="links">
          <Link href="/docs/usage">Usage</Link>
          <Link href="/docs/benchmarks">Benchmarks</Link>
          <a href={SITE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={SITE.docker} target="_blank" rel="noopener noreferrer">Docker Hub</a>
        </div>
      </div>
    </footer>
  );
}
