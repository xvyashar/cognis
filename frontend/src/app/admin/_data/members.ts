export type Member = {
  id: string;
  fullName: string;
  identifier: string;
  email: string;
  isActive: boolean;
};

export const mockMembers: Member[] = [
  {
    id: "1",
    fullName: "Amara Okafor",
    identifier: "EMP-001",
    email: "amara.okafor@example.com",
    isActive: true,
  },
  {
    id: "2",
    fullName: "Daniel Mercer",
    identifier: "EMP-002",
    email: "daniel.mercer@example.com",
    isActive: true,
  },
  {
    id: "3",
    fullName: "Priya Nair",
    identifier: "EMP-003",
    email: "priya.nair@example.com",
    isActive: false,
  },
  {
    id: "4",
    fullName: "Jonas Weber",
    identifier: "EMP-004",
    email: "jonas.weber@example.com",
    isActive: true,
  },
  {
    id: "5",
    fullName: "Mei Lin",
    identifier: "EMP-005",
    email: "mei.lin@example.com",
    isActive: true,
  },
  {
    id: "6",
    fullName: "Samuel Adeyemi",
    identifier: "EMP-006",
    email: "samuel.adeyemi@example.com",
    isActive: false,
  },
];
