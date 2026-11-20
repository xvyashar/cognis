"use client";

import { useMemo, useState } from "react";

import { DateTimePicker } from "../_components/date-time-picker";
import {
  mockAttendanceLogs,
  type AttendanceLog,
} from "../_data/attendance-logs";
import { mockEvents } from "../_data/events";
import { mockMembers, type Member } from "../_data/members";

const NOT_ATTACHED = "not-attached";
const ONLY_ATTACHED = "only-attached";

const shortWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const shortMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const eventById = new Map(mockEvents.map((event) => [event.id, event]));

const memberById = new Map(
  mockMembers.map((member) => [member.id, member]),
);

const filterTags = [
  ...mockEvents.map((event) => ({ id: event.id, name: event.name })),
  { id: ONLY_ATTACHED, name: "Only Attached" },
  { id: NOT_ATTACHED, name: "Not Attached" },
];

function formatCheckedIn(value: string) {
  const [date = "", time = ""] = value.split("T");
  const [rawYear = "", rawMonth = "", rawDay = ""] = date.split("-");
  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);

  if (!time || !year || !month || !day) return value;

  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return `${shortWeekdays[weekday]} ${day} ${
    shortMonths[month - 1]
  } ${year}, ${time.slice(0, 5)}`;
}

function eventName(log: AttendanceLog) {
  if (!log.eventId) return null;
  return eventById.get(log.eventId)?.name ?? "Unknown event";
}

function csvCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function matchesQuery(member: Member | undefined, query: string) {
  if (!member) return false;

  return [member.fullName, member.identifier, member.email].some((value) =>
    value.toLowerCase().includes(query),
  );
}

export default function AttendanceLogsPage() {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return mockAttendanceLogs.filter((log) => {
      if (q && !matchesQuery(memberById.get(log.memberId), q)) return false;

      if (selectedTags.length > 0) {
        const matchesTag =
          (log.eventId !== null && selectedTags.includes(log.eventId)) ||
          (log.eventId === null && selectedTags.includes(NOT_ATTACHED)) ||
          (log.eventId !== null && selectedTags.includes(ONLY_ATTACHED));

        if (!matchesTag) return false;
      }

      if (from && log.checkedInAt < from) return false;
      if (to && log.checkedInAt > to) return false;

      return true;
    });
  }, [from, query, selectedTags, to]);

  const hasFilters =
    query.trim() !== "" ||
    selectedTags.length > 0 ||
    from !== "" ||
    to !== "";

  function toggleTag(id: string) {
    setSelectedTags((current) =>
      current.includes(id)
        ? current.filter((tag) => tag !== id)
        : [...current, id],
    );
  }

  function clearFilters() {
    setQuery("");
    setSelectedTags([]);
    setFrom("");
    setTo("");
  }

  function exportReport() {
    const header = ["Member", "Identifier", "Email", "Event", "Checked in"];
    const rows = filtered.map((log) => {
      const member = memberById.get(log.memberId);

      return [
        member?.fullName ?? "",
        member?.identifier ?? "",
        member?.email ?? "",
        eventName(log) ?? "Not Attached",
        formatCheckedIn(log.checkedInAt),
      ];
    });

    const csv = [header, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");

    link.href = url;
    link.download = `attendance-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Attendance Logs
          </h1>
          <p className="mt-2 text-sm text-muted">
            Review check-ins across events and export them.
          </p>
        </div>
        <button
          type="button"
          onClick={exportReport}
          disabled={filtered.length === 0}
          className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-40 sm:w-auto"
        >
          <DownloadIcon />
          Export report
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative w-full sm:max-w-xs">
            <span className="sr-only">Search members</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, ID or email"
              autoComplete="off"
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-muted focus:outline-none"
            />
          </label>
          <p className="text-xs text-muted">
            {filtered.length} of {mockAttendanceLogs.length} logs
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filterTags.map((tag) => {
            const selected = selectedTags.includes(tag.id);

            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleTag(tag.id)}
                className={`rounded-md border px-2 py-1 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-line text-muted hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
            <div className="flex w-full flex-col gap-1.5 sm:w-72">
              <span className="text-xs text-muted">From</span>
              <DateTimePicker
                value={from}
                onChange={(value) => {
                  setFrom(value);
                  if (value && to && value > to) setTo(value);
                }}
                placeholder="Any time"
                ariaLabel="Checked in from"
              />
            </div>
            <div className="flex w-full flex-col gap-1.5 sm:w-72">
              <span className="text-xs text-muted">To</span>
              <DateTimePicker
                value={to}
                onChange={(value) => {
                  setTo(value);
                  if (value && from && value < from) setFrom(value);
                }}
                placeholder="Any time"
                ariaLabel="Checked in to"
              />
            </div>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="self-start rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:self-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No logs match the current filters.
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium">Event</th>
                  <th className="pb-3 font-medium">Checked in</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => {
                  const member = memberById.get(log.memberId);
                  const name = eventName(log);

                  return (
                    <tr
                      key={log.id}
                      className="border-b border-line/60 transition-colors last:border-0 hover:bg-surface-hover/40"
                    >
                      <td className="py-4 pr-4">
                        <p className="font-medium">
                          {member?.fullName ?? "Unknown member"}
                        </p>
                        {member && (
                          <p className="mt-0.5 text-xs text-muted">
                            {member.identifier}
                          </p>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        {name ? (
                          <span>{name}</span>
                        ) : (
                          <span className="text-muted">Not Attached</span>
                        )}
                      </td>
                      <td className="py-4 tabular-nums">
                        {formatCheckedIn(log.checkedInAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 lg:hidden">
            {filtered.map((log) => {
              const member = memberById.get(log.memberId);
              const name = eventName(log);

              return (
                <li
                  key={log.id}
                  className="rounded-lg border border-line bg-surface p-4"
                >
                  <p className="truncate font-medium">
                    {member?.fullName ?? "Unknown member"}
                  </p>
                  {member && (
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {member.identifier}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    {name ?? "Not Attached"}
                  </p>
                  <p className="mt-2 text-xs tabular-nums text-muted">
                    {formatCheckedIn(log.checkedInAt)}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}
