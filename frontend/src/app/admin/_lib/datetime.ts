export const shortWeekdays = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export const shortMonths = [
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

export const longMonths = [
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

export const isoWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const hours = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);

export const minutes = Array.from({ length: 60 }, (_, minute) =>
  String(minute).padStart(2, "0"),
);

export type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  time: string;
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function weekdayOf(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** Parses the `YYYY-MM-DDTHH:mm` values used by the admin forms and mock data. */
export function parseDateTime(value: string): DateTimeParts | null {
  const [datePart = "", timePart = ""] = value.split("T");
  const [rawYear = "", rawMonth = "", rawDay = ""] = datePart.split("-");
  const time = timePart.slice(0, 5);

  if (!timePattern.test(time)) return null;

  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);

  if (!Number.isInteger(year) || year < 1000 || year > 9999) return null;
  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  if (!Number.isInteger(day) || day < 1 || day > daysInMonth(year, month)) {
    return null;
  }

  return { year, month, day, time };
}

export function formatDatePart(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function toDateTimeValue({ year, month, day, time }: DateTimeParts) {
  return `${formatDatePart(year, month, day)}T${time}`;
}

export function formatDateTime(value: string) {
  const parts = parseDateTime(value);
  if (!parts) return value;

  const weekday = weekdayOf(parts.year, parts.month, parts.day);

  return `${shortWeekdays[weekday]} ${parts.day} ${
    shortMonths[parts.month - 1]
  } ${parts.year}, ${parts.time}`;
}

export function formatFullDate(year: number, month: number, day: number) {
  const weekday = weekdayOf(year, month, day);
  return `${shortWeekdays[weekday]} ${day} ${longMonths[month - 1]} ${year}`;
}

export function formatTimeRange(startsAt: string, endsAt: string) {
  const start = formatDateTime(startsAt);
  if (!endsAt) return start;

  if (startsAt.slice(0, 10) === endsAt.slice(0, 10)) {
    return `${start} – ${endsAt.slice(11, 16)}`;
  }

  return `${start} – ${formatDateTime(endsAt)}`;
}
