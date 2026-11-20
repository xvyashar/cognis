import type { Device } from "../_data/devices";
import { formatDatePart, pad, parseDateTime } from "./datetime";

const dayMs = 86_400_000;
const tokenPrefix = "cgn_";

export const validityLimits = { min: 1, max: 3650 };

export function createAccessToken() {
  const bytes = new Uint8Array(16);

  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return `${tokenPrefix}${Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")}`;
}

export function maskAccessToken(token: string) {
  return `${token.slice(0, tokenPrefix.length + 4)}••••${token.slice(-4)}`;
}

/** Current time as a `YYYY-MM-DDTHH:mm` value, the format used across the admin pages. */
export function nowValue() {
  const now = new Date();

  return `${formatDatePart(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function tokenExpiresAt(
  device: Pick<Device, "tokenIssuedAt" | "tokenValidityDays">,
) {
  const issued = parseDateTime(device.tokenIssuedAt);
  if (!issued) return device.tokenIssuedAt;

  const [rawHour = "0", rawMinute = "0"] = issued.time.split(":");
  const issuedAt = Date.UTC(
    issued.year,
    issued.month - 1,
    issued.day,
    Number(rawHour),
    Number(rawMinute),
  );
  const expiry = new Date(issuedAt + device.tokenValidityDays * dayMs);

  return `${formatDatePart(
    expiry.getUTCFullYear(),
    expiry.getUTCMonth() + 1,
    expiry.getUTCDate(),
  )}T${pad(expiry.getUTCHours())}:${pad(expiry.getUTCMinutes())}`;
}

/** `now` is null until the client has mounted, since prerendering may not read the clock. */
export function isTokenExpired(device: Device, now: string | null) {
  return now !== null && tokenExpiresAt(device) <= now;
}

export function formatValidity(days: number) {
  return days === 1 ? "1 day" : `${days} days`;
}
