export type AdminEvent = {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  isOpen: boolean;
  startsAt: string;
  endsAt: string;
  isRepeating: boolean;
  repeatDays: number[];
};

export const mockEvents: AdminEvent[] = [
  {
    id: "1",
    name: "Annual General Meeting",
    description: "Company-wide review of the year.",
    memberIds: [],
    isOpen: true,
    startsAt: "2026-11-24T09:00",
    endsAt: "2026-11-24T11:00",
    isRepeating: false,
    repeatDays: [],
  },
  {
    id: "2",
    name: "Design Sync",
    description: "Weekly critique of design work.",
    memberIds: [],
    isOpen: true,
    startsAt: "2026-11-25T10:00",
    endsAt: "2026-11-25T11:00",
    isRepeating: true,
    repeatDays: [3],
  },
  {
    id: "3",
    name: "Security Briefing",
    description: "Access control and incident response.",
    memberIds: ["1", "2"],
    isOpen: false,
    startsAt: "2026-12-01T14:00",
    endsAt: "2026-12-01T15:30",
    isRepeating: false,
    repeatDays: [],
  },
  {
    id: "4",
    name: "Leadership Standup",
    description: "Planning for the week ahead.",
    memberIds: ["1", "4", "5"],
    isOpen: false,
    startsAt: "2026-12-02T08:30",
    endsAt: "2026-12-02T09:00",
    isRepeating: true,
    repeatDays: [1, 3],
  },
  {
    id: "5",
    name: "Onboarding Session",
    description: "Orientation for new hires.",
    memberIds: ["2", "5"],
    isOpen: false,
    startsAt: "2026-12-09T11:00",
    endsAt: "2026-12-09T12:30",
    isRepeating: false,
    repeatDays: [],
  },
  {
    id: "6",
    name: "Year-End Town Hall",
    description: "Wrap-up and Q&A with leadership.",
    memberIds: [],
    isOpen: true,
    startsAt: "2026-12-18T16:00",
    endsAt: "2026-12-18T18:00",
    isRepeating: false,
    repeatDays: [],
  },
];
