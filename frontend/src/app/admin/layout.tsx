import type { Metadata } from "next";
import { AdminNav } from "./_components/admin-nav";

export const metadata: Metadata = {
  title: "Admin — cognis",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen text-foreground">
      <aside className="flex w-60 shrink-0 flex-col gap-8 border-r border-line px-3 py-6">
        <div className="px-2">
          <p className="text-sm font-semibold tracking-tight">cognis</p>
          <p className="text-xs text-muted">Admin</p>
        </div>
        <AdminNav />
      </aside>
      <main className="flex-1 px-8 py-10">{children}</main>
    </div>
  );
}
