"use client";

import { useEffect, useRef, useState } from "react";

import {
  formatDatePart,
  formatDateTime,
  formatFullDate,
  hours,
  isoWeekdays,
  longMonths,
  minutes,
  parseDateTime,
  toDateTimeValue,
  type DateTimeParts,
} from "../_lib/datetime";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "./icons";

const fieldClass =
  "flex w-full items-center justify-between gap-3 rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-muted focus:outline-none";

const timeSelectClass =
  "appearance-none rounded-md border border-line bg-background py-1.5 pr-6 pl-2 text-sm tabular-nums text-foreground transition-colors focus:border-muted focus:outline-none";

function currentMonth() {
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() + 1 };
}

/** Only shown before the popover opens, which always recomputes the month. */
const initialMonth = { year: 2026, month: 1 };

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  ariaLabel,
  defaultTime = "00:00",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  /** Time used for a picked day when the field is still empty. */
  defaultTime?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const parts = parseDateTime(value);
    return parts ? { year: parts.year, month: parts.month } : initialMonth;
  });
  const pickerRef = useRef<HTMLDivElement>(null);

  const selected = parseDateTime(value);
  const selectedTime = selected?.time ?? defaultTime;
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
    const parts = parseDateTime(value);
    setViewMonth(
      parts ? { year: parts.year, month: parts.month } : currentMonth(),
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
    onChange(toDateTimeValue({ year, month, day, time: selectedTime }));
    setViewMonth({ year, month });
  }

  function baseParts(): DateTimeParts {
    if (selected) return selected;

    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
      time: defaultTime,
    };
  }

  function selectHour(nextHour: string) {
    onChange(toDateTimeValue({ ...baseParts(), time: `${nextHour}:${minute}` }));
  }

  function selectMinute(nextMinute: string) {
    onChange(toDateTimeValue({ ...baseParts(), time: `${hour}:${nextMinute}` }));
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
        aria-label={value ? `${ariaLabel}, ${formatDateTime(value)}` : ariaLabel}
        className={fieldClass}
      >
        <span className={value ? "" : "text-muted"}>
          {value ? formatDateTime(value) : placeholder}
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
                  key={formatDatePart(date.year, date.month, date.day)}
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
