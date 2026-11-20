import type { Metadata } from "next";
import { AdminNav } from "./_components/admin-nav";

export const metadata: Metadata = {
  title: "Admin — cognis",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-col text-foreground md:flex-row">
      <aside className="flex shrink-0 flex-col gap-4 border-b border-line px-3 py-4 md:w-60 md:gap-8 md:border-r md:border-b-0 md:py-6">
        <div className="px-2">
          <p className="text-sm font-semibold tracking-tight">cognis</p>
          <p className="text-xs text-muted">Admin</p>
        </div>
        <AdminNav />
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
