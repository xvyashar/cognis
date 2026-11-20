"use client";

import { useEffect, useRef, useState } from "react";

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

const longMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const isoWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const hours = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);

const minutes = Array.from({ length: 60 }, (_, minute) =>
  String(minute).padStart(2, "0"),
);

const fieldClass =
  "flex w-full items-center justify-between gap-3 rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-muted focus:outline-none";

const timeSelectClass =
  "appearance-none rounded-md border border-line bg-background py-1.5 pr-6 pl-2 text-sm tabular-nums text-foreground transition-colors focus:border-muted focus:outline-none";

type Parts = { year: number; month: number; day: number; time: string };

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseValue(value: string): Parts | null {
  const [date = "", time = ""] = value.split("T");
  const [rawYear = "", rawMonth = "", rawDay = ""] = date.split("-");
  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);

  if (!time || !year || !month || !day) return null;

  return { year, month, day, time: time.slice(0, 5) };
}

function toValue({ year, month, day, time }: Parts) {
  return `${year}-${pad(month)}-${pad(day)}T${time}`;
}

function formatValue(value: string) {
  const parts = parseValue(value);
  if (!parts) return value;

  const weekday = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day),
  ).getUTCDay();

  return `${shortWeekdays[weekday]} ${parts.day} ${
    shortMonths[parts.month - 1]
  } ${parts.year}, ${parts.time}`;
}

function formatFullDate(year: number, month: number, day: number) {
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${shortWeekdays[weekday]} ${day} ${longMonths[month - 1]} ${year}`;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const parts = parseValue(value);
    return parts ? { year: parts.year, month: parts.month } : { year: 2026, month: 1 };
  });
  const pickerRef = useRef<HTMLDivElement>(null);

  const selected = parseValue(value);
  const selectedTime = selected?.time ?? "00:00";
  const [hour = "00", minute = "00"] = selectedTime.split(":");

  const monthStart = new Date(Date.UTC(viewMonth.year, viewMonth.month - 1, 1));
  const mondayOffset = (monthStart.getUTCDay() + 6) % 7;
  const visibleDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      Date.UTC(viewMonth.year, viewMonth.month - 1, 1 - mondayOffset + index),
    );

    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === viewMonth.month - 1,
    };
  });

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function openPicker() {
    const parts = parseValue(value);
    const today = new Date();

    setViewMonth(
      parts
        ? { year: parts.year, month: parts.month }
        : { year: today.getFullYear(), month: today.getMonth() + 1 },
    );
    setIsOpen(true);
  }

  function togglePicker() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    openPicker();
  }

  function moveMonth(delta: number) {
    setViewMonth((current) => {
      const date = new Date(Date.UTC(current.year, current.month - 1 + delta, 1));
      return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
    });
  }

  function selectDay(year: number, month: number, day: number) {
    onChange(toValue({ year, month, day, time: selectedTime }));
    setViewMonth({ year, month });
  }

  function baseParts(): Parts {
    if (selected) return selected;

    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
      time: "00:00",
    };
  }

  function selectHour(nextHour: string) {
    onChange(toValue({ ...baseParts(), time: `${nextHour}:${minute}` }));
  }

  function selectMinute(nextMinute: string) {
    onChange(toValue({ ...baseParts(), time: `${hour}:${nextMinute}` }));
  }

  function selectToday() {
    const today = new Date();
    selectDay(today.getFullYear(), today.getMonth() + 1, today.getDate());
  }

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        onClick={togglePicker}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={value ? `${ariaLabel}, ${formatValue(value)}` : ariaLabel}
        className={fieldClass}
      >
        <span className={value ? "" : "text-muted"}>
          {value ? formatValue(value) : placeholder}
        </span>
        <CalendarIcon />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={ariaLabel}
          className="absolute left-0 top-full z-20 mt-2 w-full max-w-xs rounded-lg border border-line bg-surface p-3"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              aria-label="Previous month"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              <ChevronLeftIcon />
            </button>
            <p className="text-xs font-medium">
              {longMonths[viewMonth.month - 1]} {viewMonth.year}
            </p>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              aria-label="Next month"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              <ChevronRightIcon />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
            {isoWeekdays.map((label) => (
              <span key={label} className="py-1">
                {label.slice(0, 2)}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {visibleDays.map((date) => {
              const isSelected =
                selected?.year === date.year &&
                selected.month === date.month &&
                selected.day === date.day;

              return (
                <button
                  key={`${date.year}-${date.month}-${date.day}`}
                  type="button"
                  onClick={() => selectDay(date.year, date.month, date.day)}
                  aria-label={formatFullDate(date.year, date.month, date.day)}
                  aria-pressed={isSelected}
                  className={`flex h-8 items-center justify-center rounded-md text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                    isSelected
                      ? "bg-foreground text-background"
                      : date.inMonth
                        ? "text-foreground hover:bg-surface-hover"
                        : "text-muted hover:bg-surface-hover"
                  }`}
                >
                  {date.day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="text-xs text-muted">Time</span>
            <div className="flex items-center gap-1.5">
              <span className="relative inline-flex">
                <select
                  aria-label="Hour"
                  value={hour}
                  onChange={(event) => selectHour(event.target.value)}
                  className={timeSelectClass}
                >
                  {hours.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-muted" />
              </span>
              <span className="text-muted">:</span>
              <span className="relative inline-flex">
                <select
                  aria-label="Minute"
                  value={minute}
                  onChange={(event) => selectMinute(event.target.value)}
                  className={timeSelectClass}
                >
                  {minutes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-muted" />
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={selectToday}
                className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                Today
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-muted"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 11h18" />
    </svg>
  );
}

function ChevronLeftIcon() {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChevronDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
