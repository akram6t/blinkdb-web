"use client";
import { useState } from "react";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      className="copy"
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1600);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {ok ? "Copied ✓" : "Copy"}
    </button>
  );
}

// Dim lines that are comments (# or //) so output/comment lines read as secondary.
function Highlighted({ code }: { code: string }) {
  return (
    <>
      {code.split("\n").map((line, i, arr) => {
        const t = line.trimStart();
        const isComment = t.startsWith("#") || t.startsWith("//");
        return (
          <span key={i} className={isComment ? "c" : undefined}>
            {line}
            {i < arr.length - 1 ? "\n" : ""}
          </span>
        );
      })}
    </>
  );
}

export function CodeBlock({ code, title = "bash" }: { code: string; title?: string }) {
  return (
    <div className="code">
      <div className="code-head">
        <span className="t">
          <span className="dots"><i /><i /><i /></span>
          {title}
        </span>
        <CopyBtn text={code} />
      </div>
      <pre><code><Highlighted code={code} /></code></pre>
    </div>
  );
}

export function Tabs({ tabs }: { tabs: { label: string; code: string }[] }) {
  const [i, setI] = useState(0);
  const cur = tabs[i];
  return (
    <div className="code tabbed">
      <div className="tabbar">
        <div className="tabs" role="tablist">
          {tabs.map((t, idx) => (
            <button key={t.label} role="tab" aria-selected={idx === i} className={idx === i ? "on" : ""} onClick={() => setI(idx)}>
              {t.label}
            </button>
          ))}
        </div>
        <CopyBtn text={cur.code} />
      </div>
      <pre><code><Highlighted code={cur.code} /></code></pre>
    </div>
  );
}

export function InstallCmd({ cmd }: { cmd: string }) {
  return (
    <div className="install">
      <span><span className="p">$</span> {cmd}</span>
      <CopyBtn text={cmd} />
    </div>
  );
}
