import Link from "next/link";
import { SITE } from "@/lib/data";

export function Bolt({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 2 4 13.5h6.2L9.5 22 20 9.8h-6.4L13.5 2Z" />
    </svg>
  );
}

export default function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link href="/" className="logo" aria-label="BlinkDB home">
          <span className="logo-mark"><Bolt /></span>
          BlinkDB
        </Link>
        <nav className="nav-links" aria-label="Main">
          <Link href="/docs/usage">Usage</Link>
          <Link href="/docs/benchmarks">Benchmarks</Link>
          <a className="hide-sm" href={SITE.docker} target="_blank" rel="noopener noreferrer">Docker Hub</a>
          <a className="btn" href={SITE.github} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", marginLeft: 8 }}>
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
