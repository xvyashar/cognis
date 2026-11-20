export type AttendanceLog = {
  id: string;
  memberId: string;
  eventId: string | null;
  checkedInAt: string;
};

export const mockAttendanceLogs: AttendanceLog[] = [
  {
    id: "15",
    memberId: "4",
    eventId: "6",
    checkedInAt: "2026-12-18T16:12",
  },
  {
    id: "14",
    memberId: "2",
    eventId: "6",
    checkedInAt: "2026-12-18T16:05",
  },
  {
    id: "13",
    memberId: "5",
    eventId: "5",
    checkedInAt: "2026-12-09T11:07",
  },
  {
    id: "12",
    memberId: "4",
    eventId: "4",
    checkedInAt: "2026-12-02T08:31",
  },
  {
    id: "11",
    memberId: "2",
    eventId: "3",
    checkedInAt: "2026-12-01T14:02",
  },
  {
    id: "10",
    memberId: "1",
    eventId: "3",
    checkedInAt: "2026-12-01T13:58",
  },
  {
    id: "9",
    memberId: "6",
    eventId: null,
    checkedInAt: "2026-11-26T13:21",
  },
  {
    id: "8",
    memberId: "5",
    eventId: "2",
    checkedInAt: "2026-11-25T10:06",
  },
  {
    id: "7",
    memberId: "2",
    eventId: "2",
    checkedInAt: "2026-11-25T10:03",
  },
  {
    id: "6",
    memberId: "3",
    eventId: null,
    checkedInAt: "2026-11-25T08:55",
  },
  {
    id: "5",
    memberId: "1",
    eventId: null,
    checkedInAt: "2026-11-25T08:42",
  },
  {
    id: "4",
    memberId: "5",
    eventId: "1",
    checkedInAt: "2026-11-24T09:18",
  },
  {
    id: "3",
    memberId: "4",
    eventId: "1",
    checkedInAt: "2026-11-24T09:11",
  },
  {
    id: "2",
    memberId: "2",
    eventId: "1",
    checkedInAt: "2026-11-24T09:07",
  },
  {
    id: "1",
    memberId: "1",
    eventId: "1",
    checkedInAt: "2026-11-24T09:04",
  },
];
