import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function IconBase({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function MembersIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M16 21v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V21" />
      <circle cx="9.5" cy="7.5" r="3.5" />
      <path d="M17.5 4.2a3.5 3.5 0 0 1 0 6.6" />
      <path d="M21 21v-1.5a4 4 0 0 0-3-3.87" />
    </IconBase>
  );
}

export function EventsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </IconBase>
  );
}

export function AttendanceLogsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6" />
      <path d="M15 4h4a2 2 0 0 1 2 2v5" />
      <path d="M7 9h6" />
      <path d="M7 13h4" />
      <path d="m15 17 2 2 4-4" />
    </IconBase>
  );
}
