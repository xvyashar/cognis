import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function IconBase({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
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

export function DevicesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
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

export function CalendarIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconBase className={`shrink-0 text-muted ${className}`}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 11h18" />
    </IconBase>
  );
}

export function ChevronLeftIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m15 18-6-6 6-6" />
    </IconBase>
  );
}

export function ChevronRightIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

export function ChevronDownIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m6 9 6 6 6-6" />
    </IconBase>
  );
}

export function CheckIcon({ className = "h-3 w-3" }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m5 13 4 4L19 7" />
    </IconBase>
  );
}

export function DownloadIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </IconBase>
  );
}

export function PencilIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </IconBase>
  );
}

export function TrashIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </IconBase>
  );
}

export function RotateIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M21 2v6h-6" />
      <path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8 1 6.4 2.6L21 8" />
    </IconBase>
  );
}

export function PlusIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function XIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </IconBase>
  );
}
