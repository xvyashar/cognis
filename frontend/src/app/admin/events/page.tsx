"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { mockEvents, type AdminEvent } from "../_data/events";
import { mockMembers } from "../_data/members";

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

const isoWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

const hours = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);

const minutes = Array.from({ length: 60 }, (_, minute) =>
  String(minute).padStart(2, "0"),
);

const activeMembers = mockMembers.filter((member) => member.isActive);

const fieldClass =
  "w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-muted focus:outline-none";

const timeSelectClass =
  "appearance-none rounded-md border border-line bg-background py-1.5 pr-6 pl-2 text-sm tabular-nums text-foreground transition-colors focus:border-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const emptyForm = {
  name: "",
  description: "",
  startsAt: "",
  endsAt: "",
  isOpen: true,
  memberIds: [] as string[],
  isRepeating: false,
  repeatDays: [] as number[],
};

type EventForm = typeof emptyForm;

function parseDateTime(value: string) {
  const [date = "", time = ""] = value.split("T");
  const [rawYear = "", rawMonth = "", rawDay = ""] = date.split("-");
  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);

  if (!time || !year || !month || !day) return null;

  return { year, month, day, time };
}

function weekdayFromValue(value: string) {
  const parsed = parseDateTime(value);
  if (!parsed) return null;

  const weekday = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day),
  ).getUTCDay();

  return weekday === 0 ? 7 : weekday;
}

function formatDateTime(value: string) {
  const parsed = parseDateTime(value);
  if (!parsed) return value;

  const weekday = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day),
  ).getUTCDay();

  return `${shortWeekdays[weekday]} ${parsed.day} ${
    shortMonths[parsed.month - 1]
  } ${parsed.year}, ${parsed.time}`;
}

function dateTimeValue(value: string) {
  const parsed = parseDateTime(value);
  if (!parsed) return null;

  const [rawHour = "0", rawMinute = "0"] = parsed.time.split(":");
  return Date.UTC(
    parsed.year,
    parsed.month - 1,
    parsed.day,
    Number(rawHour),
    Number(rawMinute),
  );
}

function offsetDateTimeValue(value: string, minutes: number) {
  const base = dateTimeValue(value);
  if (base === null) return "";

  const date = new Date(base + minutes * 60_000);
  return `${formatDatePart(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

function formatTimeRange(startsAt: string, endsAt: string) {
  const start = formatDateTime(startsAt);
  if (!endsAt) return start;

  if (startsAt.slice(0, 10) === endsAt.slice(0, 10)) {
    return `${start} – ${endsAt.slice(11, 16)}`;
  }

  return `${start} – ${formatDateTime(endsAt)}`;
}

function formatRepeatDays(days: number[]) {
  if (days.length === 7) return "Every day";

  const weekdays = [1, 2, 3, 4, 5];
  if (days.length === 5 && weekdays.every((day) => days.includes(day))) {
    return "Every weekday";
  }

  return `Every ${days.map((day) => isoWeekdays[day - 1]).join(", ")}`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDatePart(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function formatFullDate(year: number, month: number, day: number) {
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${shortWeekdays[weekday]} ${day} ${longMonths[month - 1]} ${year}`;
}

function memberSummary(event: AdminEvent) {
  if (event.isOpen) return "All members";
  return event.memberIds.length === 1
    ? "1 member"
    : `${event.memberIds.length} members`;
}

export default function EventsPage() {
  const [events, setEvents] = useState(mockEvents);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [pickerQuery, setPickerQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState({ year: 2026, month: 1 });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;

    return events.filter((event) =>
      [event.name, event.description].some((value) =>
        value.toLowerCase().includes(q),
      ),
    );
  }, [events, query]);

  const pickerMembers = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return activeMembers;

    return activeMembers.filter((member) =>
      [member.fullName, member.identifier].some((value) =>
        value.toLowerCase().includes(q),
      ),
    );
  }, [pickerQuery]);

  const selectedDateTime = parseDateTime(form.startsAt);
  const selectedEndDateTime = parseDateTime(form.endsAt);
  const selectedTime = selectedDateTime?.time ?? "09:00";
  const [pickerHour = "09", pickerMinute = "00"] = selectedTime.split(":");
  const selectedEndTime =
    selectedEndDateTime?.time ??
    parseDateTime(offsetDateTimeValue(form.startsAt, 60))?.time ??
    "10:00";
  const [pickerEndHour = "10", pickerEndMinute = "00"] =
    selectedEndTime.split(":");
  const endsNextDay =
    !!selectedDateTime &&
    !!selectedEndDateTime &&
    form.endsAt.slice(0, 10) > form.startsAt.slice(0, 10);

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
    if (!isPickerOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, [isPickerOpen]);

  function removeEvent(id: string) {
    setEvents((current) => current.filter((event) => event.id !== id));
  }

  function toggleOpen(id: string) {
    setEvents((current) =>
      current.map((event) =>
        event.id === id ? { ...event, isOpen: !event.isOpen } : event,
      ),
    );
  }

  function toggleRepeating(id: string) {
    setEvents((current) =>
      current.map((event) => {
        if (event.id !== id) return event;
        if (event.isRepeating) return { ...event, isRepeating: false };

        return {
          ...event,
          isRepeating: true,
          repeatDays:
            event.repeatDays.length > 0
              ? event.repeatDays
              : [weekdayFromValue(event.startsAt) ?? 1],
        };
      }),
    );
  }

  function openAddDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setPickerQuery("");
    setIsPickerOpen(false);
    showDialog();
  }

  function openEditDialog(event: AdminEvent) {
    setEditingId(event.id);
    setForm({
      name: event.name,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      isOpen: event.isOpen,
      memberIds: event.memberIds,
      isRepeating: event.isRepeating,
      repeatDays: event.repeatDays,
    });
    setFormError("");
    setPickerQuery("");
    setIsPickerOpen(false);
    showDialog();
  }

  function showDialog() {
    dialogRef.current?.showModal();
    dialogRef.current
      ?.querySelector<HTMLInputElement>('input[name="eventName"]')
      ?.focus();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function updateForm(patch: Partial<EventForm>) {
    setForm((current) => ({ ...current, ...patch }));
    setFormError("");
  }

  function toggleFormOpen() {
    updateForm({ isOpen: !form.isOpen });
  }

  function toggleFormRepeating() {
    if (form.isRepeating) {
      updateForm({ isRepeating: false });
      return;
    }

    updateForm({
      isRepeating: true,
      repeatDays:
        form.repeatDays.length > 0
          ? form.repeatDays
          : [weekdayFromValue(form.startsAt) ?? 1],
    });
  }

  function toggleFormMember(id: string) {
    updateForm({
      memberIds: form.memberIds.includes(id)
        ? form.memberIds.filter((memberId) => memberId !== id)
        : [...form.memberIds, id],
    });
  }

  function toggleFormDay(day: number) {
    updateForm({
      repeatDays: form.repeatDays.includes(day)
        ? form.repeatDays.filter((value) => value !== day)
        : [...form.repeatDays, day].sort((a, b) => a - b),
    });
  }

  function selectAllMembers() {
    updateForm({ memberIds: activeMembers.map((member) => member.id) });
  }

  function moveMonth(delta: number) {
    const date = new Date(
      Date.UTC(viewMonth.year, viewMonth.month - 1 + delta, 1),
    );

    setViewMonth({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
    });
  }

  function openPicker() {
    const parsed = parseDateTime(form.startsAt);
    const today = new Date();

    setViewMonth(
      parsed
        ? { year: parsed.year, month: parsed.month }
        : { year: today.getFullYear(), month: today.getMonth() + 1 },
    );
    setIsPickerOpen(true);
  }

  function togglePicker() {
    if (isPickerOpen) {
      setIsPickerOpen(false);
      return;
    }

    openPicker();
  }

  function endFor(startsAt: string) {
    const start = dateTimeValue(form.startsAt);
    const end = dateTimeValue(form.endsAt);
    const duration =
      start !== null && end !== null && end > start
        ? Math.round((end - start) / 60_000)
        : 60;

    return offsetDateTimeValue(startsAt, duration);
  }

  function withStartDate(hour: string, minute: string) {
    const parsed = parseDateTime(form.startsAt);
    const today = new Date();
    const datePart = parsed
      ? formatDatePart(parsed.year, parsed.month, parsed.day)
      : formatDatePart(
          today.getFullYear(),
          today.getMonth() + 1,
          today.getDate(),
        );

    return `${datePart}T${hour}:${minute}`;
  }

  function selectDay(year: number, month: number, day: number) {
    const startsAt = `${formatDatePart(year, month, day)}T${selectedTime}`;
    updateForm({ startsAt, endsAt: endFor(startsAt) });
    setViewMonth({ year, month });
  }

  function selectStartTime(hour: string, minute: string) {
    const startsAt = withStartDate(hour, minute);
    updateForm({ startsAt, endsAt: endFor(startsAt) });
  }

  function selectEndTime(hour: string, minute: string) {
    const parsed = parseDateTime(form.startsAt);
    if (!parsed) return;

    const sameDay = `${formatDatePart(parsed.year, parsed.month, parsed.day)}T${hour}:${minute}`;
    updateForm({
      endsAt:
        sameDay > form.startsAt ? sameDay : offsetDateTimeValue(sameDay, 1440),
    });
  }

  function selectToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const startsAt = `${formatDatePart(year, month, day)}T${selectedTime}`;

    updateForm({ startsAt, endsAt: endFor(startsAt) });
    setViewMonth({ year, month });
  }

  function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    if (!name) {
      setFormError("Enter an event name.");
      return;
    }
    if (!form.startsAt) {
      setFormError("Choose a start date and time.");
      return;
    }
    if (!form.endsAt) {
      setFormError("Choose an end time.");
      return;
    }
    if (form.endsAt <= form.startsAt) {
      setFormError("End time must be after the start time.");
      return;
    }
    if (!form.isOpen && form.memberIds.length === 0) {
      setFormError("Select at least one allowed member.");
      return;
    }
    if (form.isRepeating && form.repeatDays.length === 0) {
      setFormError("Select at least one repeat day.");
      return;
    }

    const values = {
      name,
      description: form.description.trim(),
      startsAt: form.startsAt,
      endsAt: form.endsAt,
      isOpen: form.isOpen,
      memberIds: form.memberIds,
      isRepeating: form.isRepeating,
      repeatDays: [...form.repeatDays].sort((a, b) => a - b),
    };

    if (editingId) {
      setEvents((current) =>
        current.map((event) =>
          event.id === editingId ? { ...event, ...values } : event,
        ),
      );
    } else {
      setEvents((current) => [
        { id: crypto.randomUUID(), ...values },
        ...current,
      ]);
    }

    setQuery("");
    dialogRef.current?.close();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="mt-2 text-sm text-muted">
            Create and manage events and who can attend.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddDialog}
          className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:w-auto"
        >
          <PlusIcon />
          Add event
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">Search events</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or description"
            autoComplete="off"
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-muted focus:outline-none"
          />
        </label>
        <p className="text-xs text-muted">
          {filtered.length} of {events.length} events
        </p>
      </div>

      {events.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No events yet. Add your first event to get started.
        </p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No events match “{query}”.
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-3 font-medium">Event</th>
                  <th className="pb-3 font-medium">When</th>
                  <th className="pb-3 font-medium">Members</th>
                  <th className="pb-3 font-medium">Open</th>
                  <th className="pb-3 font-medium">Repeating</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-line/60 transition-colors last:border-0 hover:bg-surface-hover/40"
                  >
                    <td className="py-4 pr-4 font-medium">{event.name}</td>
                    <td className="py-4 pr-4">
                      <p>{formatTimeRange(event.startsAt, event.endsAt)}</p>
                      {event.isRepeating && event.repeatDays.length > 0 && (
                        <p className="mt-0.5 text-xs text-muted">
                          {formatRepeatDays(event.repeatDays)}
                        </p>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-muted">
                      {memberSummary(event)}
                    </td>
                    <td className="py-4 pr-4">
                      <Switch
                        checked={event.isOpen}
                        onChange={() => toggleOpen(event.id)}
                        label={event.isOpen ? "Open" : "Restricted"}
                        ariaLabel={`Toggle ${event.name} open status`}
                      />
                    </td>
                    <td className="py-4 pr-4">
                      <Switch
                        checked={event.isRepeating}
                        onChange={() => toggleRepeating(event.id)}
                        label={event.isRepeating ? "Weekly" : "One-off"}
                        ariaLabel={`Toggle ${event.name} repeat status`}
                      />
                    </td>
                    <td className="py-4 text-right">
                      <EventActions
                        event={event}
                        onEdit={() => openEditDialog(event)}
                        onDelete={() => removeEvent(event.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 lg:hidden">
            {filtered.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-line bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{event.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatTimeRange(event.startsAt, event.endsAt)}
                    </p>
                    {event.isRepeating && event.repeatDays.length > 0 && (
                      <p className="text-xs text-muted">
                        {formatRepeatDays(event.repeatDays)}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted">
                      {memberSummary(event)}
                    </p>
                  </div>
                  <EventActions
                    event={event}
                    onEdit={() => openEditDialog(event)}
                    onDelete={() => removeEvent(event.id)}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <Switch
                    checked={event.isOpen}
                    onChange={() => toggleOpen(event.id)}
                    label={event.isOpen ? "Open" : "Restricted"}
                    ariaLabel={`Toggle ${event.name} open status`}
                  />
                  <Switch
                    checked={event.isRepeating}
                    onChange={() => toggleRepeating(event.id)}
                    label={event.isRepeating ? "Weekly" : "One-off"}
                    ariaLabel={`Toggle ${event.name} repeat status`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => {
          setForm(emptyForm);
          setEditingId(null);
          setFormError("");
          setPickerQuery("");
          setIsPickerOpen(false);
        }}
        onCancel={(event) => {
          if (isPickerOpen) {
            event.preventDefault();
            setIsPickerOpen(false);
          }
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        aria-labelledby="event-dialog-title"
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-lg border border-line bg-surface p-0 text-foreground backdrop:bg-black/70"
      >
        <form
          onSubmit={submitEvent}
          className="flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col"
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2 id="event-dialog-title" className="text-sm font-semibold">
                {editingId ? "Edit event" : "Add event"}
              </h2>
              <p className="mt-1 text-xs text-muted">
                Set when the event runs and who may attend.
              </p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close"
              className="-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              <XIcon />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">Name</span>
              <input
                name="eventName"
                required
                autoComplete="off"
                placeholder="Annual General Meeting"
                value={form.name}
                onChange={(event) => updateForm({ name: event.target.value })}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">Description</span>
              <textarea
                name="description"
                rows={3}
                placeholder="Optional details"
                value={form.description}
                onChange={(event) =>
                  updateForm({ description: event.target.value })
                }
                className={fieldClass}
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">Date and time</span>
              <div ref={pickerRef} className="relative">
                <button
                  type="button"
                  onClick={togglePicker}
                  aria-haspopup="dialog"
                  aria-expanded={isPickerOpen}
                  aria-label={
                    form.startsAt
                      ? `Date and time, ${formatTimeRange(
                          form.startsAt,
                          form.endsAt,
                        )}`
                      : "Select date and time"
                  }
                  className={`${fieldClass} flex items-center justify-between gap-3 text-left`}
                >
                  <span className={form.startsAt ? "" : "text-muted"}>
                    {form.startsAt
                      ? formatTimeRange(form.startsAt, form.endsAt)
                      : "Select date and time"}
                  </span>
                  <CalendarIcon />
                </button>

                {isPickerOpen && (
                  <div
                    role="dialog"
                    aria-label="Choose date and time"
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
                        const selected =
                          selectedDateTime?.year === date.year &&
                          selectedDateTime.month === date.month &&
                          selectedDateTime.day === date.day;

                        return (
                          <button
                            key={`${date.year}-${date.month}-${date.day}`}
                            type="button"
                            onClick={() =>
                              selectDay(date.year, date.month, date.day)
                            }
                            aria-label={formatFullDate(
                              date.year,
                              date.month,
                              date.day,
                            )}
                            aria-pressed={selected}
                            className={`flex h-8 items-center justify-center rounded-md text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                              selected
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

                    <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
                      <TimeSelects
                        label="Starts"
                        hour={pickerHour}
                        minute={pickerMinute}
                        onChange={selectStartTime}
                      />
                      <TimeSelects
                        label="Ends"
                        hour={pickerEndHour}
                        minute={pickerEndMinute}
                        disabled={!selectedDateTime}
                        onChange={selectEndTime}
                      />
                      {endsNextDay && (
                        <p className="text-right text-[11px] text-muted">
                          Ends the next day
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
                      <button
                        type="button"
                        onClick={selectToday}
                        className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPickerOpen(false)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted">Open to all members</span>
                <Switch
                  checked={form.isOpen}
                  onChange={toggleFormOpen}
                  label={form.isOpen ? "Open" : "Restricted"}
                  ariaLabel="Open to all members"
                />
              </div>
              <p className="text-xs text-muted">
                When on, every member may attend.
              </p>
            </div>

            {!form.isOpen && (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted">Allowed members</span>
                <input
                  type="search"
                  value={pickerQuery}
                  onChange={(event) => setPickerQuery(event.target.value)}
                  placeholder="Search members"
                  autoComplete="off"
                  aria-label="Search allowed members"
                  className={fieldClass}
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted">
                    {form.memberIds.length} selected
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={selectAllMembers}
                      className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() => updateForm({ memberIds: [] })}
                      className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="max-h-44 overflow-y-auto rounded-md border border-line">
                  {pickerMembers.length === 0 ? (
                    <p className="px-3 py-4 text-center text-xs text-muted">
                      No members match
                    </p>
                  ) : (
                    pickerMembers.map((member) => {
                      const checked = form.memberIds.includes(member.id);

                      return (
                        <label
                          key={member.id}
                          className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-surface-hover"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleFormMember(member.id)}
                            className="peer sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground ${
                              checked
                                ? "border-foreground bg-foreground text-background"
                                : "border-line bg-background"
                            }`}
                          >
                            {checked && <CheckIcon />}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate">
                              {member.fullName}
                            </span>
                            <span className="block truncate text-xs text-muted">
                              {member.identifier}
                            </span>
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted">Repeats weekly</span>
                <Switch
                  checked={form.isRepeating}
                  onChange={toggleFormRepeating}
                  label={form.isRepeating ? "Weekly" : "One-off"}
                  ariaLabel="Repeats weekly"
                />
              </div>
              {form.isRepeating && (
                <div className="flex flex-wrap gap-1.5">
                  {isoWeekdays.map((label, index) => {
                    const day = index + 1;
                    const selected = form.repeatDays.includes(day);

                    return (
                      <button
                        key={day}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleFormDay(day)}
                        className={`rounded-md border px-2 py-1 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-line text-muted hover:bg-surface-hover hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {formError && (
            <p className="px-5 pt-3 text-xs text-danger">{formError}</p>
          )}

          <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
            <button
              type="button"
              onClick={closeDialog}
              className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {editingId ? "Save changes" : "Add event"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className="inline-flex items-center gap-2 rounded-md py-1 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      <span
        className={`relative inline-flex h-4 w-8 items-center rounded-full border transition-colors ${
          checked
            ? "border-foreground bg-foreground"
            : "border-line bg-surface-hover"
        }`}
      >
        <span
          className={`h-3 w-3 rounded-full transition-transform ${
            checked
              ? "translate-x-[18px] bg-background"
              : "translate-x-0.5 bg-muted"
          }`}
        />
      </span>
      <span>{label}</span>
    </button>
  );
}

function TimeSelects({
  label,
  hour,
  minute,
  disabled = false,
  onChange,
}: {
  label: string;
  hour: string;
  minute: string;
  disabled?: boolean;
  onChange: (hour: string, minute: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="relative inline-flex">
          <select
            aria-label={`${label} hour`}
            value={hour}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value, minute)}
            className={timeSelectClass}
          >
            {hours.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-muted" />
        </span>
        <span className="text-muted">:</span>
        <span className="relative inline-flex">
          <select
            aria-label={`${label} minute`}
            value={minute}
            disabled={disabled}
            onChange={(event) => onChange(hour, event.target.value)}
            className={timeSelectClass}
          >
            {minutes.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-muted" />
        </span>
      </div>
    </div>
  );
}

function EventActions({
  event,
  onEdit,
  onDelete,
}: {
  event: AdminEvent;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="inline-flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        title="Edit event"
        aria-label={`Edit ${event.name}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <PencilIcon />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${event.name}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function PencilIcon() {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
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
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function PlusIcon() {
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
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function XIcon() {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function ChevronLeftIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChevronDownIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
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
