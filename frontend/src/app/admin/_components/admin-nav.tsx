"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AttendanceLogsIcon,
  DevicesIcon,
  EventsIcon,
  MembersIcon,
} from "./icons";

const items = [
  { href: "/admin/members", label: "Members", Icon: MembersIcon },
  { href: "/admin/devices", label: "Devices", Icon: DevicesIcon },
  { href: "/admin/events", label: "Events", Icon: EventsIcon },
  {
    href: "/admin/attendance-logs",
    label: "Attendance Logs",
    Icon: AttendanceLogsIcon,
  },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
              active
                ? "bg-foreground text-background"
                : "text-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            <item.Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
