"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    group: "Documentation",
    items: [
      { href: "/docs/usage", label: "Usage", subs: [["quickstart", "Quickstart"], ["build", "Build from source"], ["verify", "Verify with redis-cli"], ["clients", "Client examples"], ["cli", "CLI reference"]] },
      { href: "/docs/benchmarks", label: "Benchmarks & comparison", subs: [["summary", "Summary"], ["method", "Methodology"], ["results", "Tier results"], ["payload", "Payload sweep"], ["scaling", "Scaling"], ["memory", "Memory"], ["limits", "Limitations"], ["reproduce", "Reproduce"]] },
    ],
  },
];

export default function DocsSidebar() {
  const path = usePathname();
  return (
    <aside className="side" aria-label="Docs navigation">
      {NAV.map((g) => (
        <div key={g.group} style={{ display: "contents" }}>
          <h4>{g.group}</h4>
          {g.items.map((it) => (
            <div key={it.href} style={{ display: "contents" }}>
              <Link href={it.href} className={path === it.href ? "on" : ""}>{it.label}</Link>
              {path === it.href && it.subs.map(([id, label]) => (
                <a key={id} href={`#${id}`} className="sub">{label}</a>
              ))}
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}
