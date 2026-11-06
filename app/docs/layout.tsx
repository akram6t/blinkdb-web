import DocsSidebar from "@/components/DocsSidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wrap docs">
      <DocsSidebar />
      <article className="prose">{children}</article>
    </div>
  );
}
