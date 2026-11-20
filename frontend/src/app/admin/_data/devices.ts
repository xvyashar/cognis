export type Device = {
  id: string;
  name: string;
  description: string;
  tokenValidityDays: number;
  accessToken: string;
  tokenIssuedAt: string;
};

export const mockDevices: Device[] = [
  {
    id: "1",
    name: "Front desk kiosk",
    description: "Check-in camera in the main lobby.",
    tokenValidityDays: 30,
    accessToken: "cgn_4f1c8e2a9b7d4316a0e5c93b7d28f104",
    tokenIssuedAt: "2026-11-18T08:30",
  },
  {
    id: "2",
    name: "Gate A turnstile",
    description: "Entrance camera at the staff gate.",
    tokenValidityDays: 7,
    accessToken: "cgn_b62d07f5ac1e4a8fb3d7e219c6a05f83",
    tokenIssuedAt: "2026-11-01T09:00",
  },
  {
    id: "3",
    name: "HR office tablet",
    description: "Enrollment station used by the HR team.",
    tokenValidityDays: 90,
    accessToken: "cgn_7a0e93c5d1b84f26b8c41e6f92d3057a",
    tokenIssuedAt: "2026-11-10T14:15",
  },
  {
    id: "4",
    name: "Warehouse terminal",
    description: "Shift check-in camera at the loading dock.",
    tokenValidityDays: 14,
    accessToken: "cgn_2e5b8f04d7c94a3eb6f10d8c45a792be",
    tokenIssuedAt: "2026-11-05T07:45",
  },
];
