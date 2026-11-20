"use client";

import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

type Member = {
  id: string;
  fullName: string;
  identifier: string;
  email: string;
  isActive: boolean;
};

const initialMembers: Member[] = [
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

const fieldClass =
  "w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-muted focus:outline-none";

const emptyForm = { fullName: "", identifier: "", email: "" };

export default function MembersPage() {
  const [members, setMembers] = useState(initialMembers);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;

    return members.filter((member) =>
      [member.fullName, member.identifier, member.email].some((value) =>
        value.toLowerCase().includes(q),
      ),
    );
  }, [members, query]);

  function removeMember(id: string) {
    setMembers((current) => current.filter((member) => member.id !== id));
  }

  function toggleMember(id: string) {
    setMembers((current) =>
      current.map((member) =>
        member.id === id ? { ...member, isActive: !member.isActive } : member,
      ),
    );
  }

  function openAddDialog() {
    setEditingId(null);
    setForm(emptyForm);
    showDialog();
  }

  function openEditDialog(member: Member) {
    setEditingId(member.id);
    setForm({
      fullName: member.fullName,
      identifier: member.identifier,
      email: member.email,
    });
    showDialog();
  }

  function showDialog() {
    dialogRef.current?.showModal();
    dialogRef.current
      ?.querySelector<HTMLInputElement>('input[name="fullName"]')
      ?.focus();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fullName = form.fullName.trim();
    if (!fullName) return;

    if (editingId) {
      setMembers((current) =>
        current.map((member) =>
          member.id === editingId
            ? {
                ...member,
                fullName,
                identifier: form.identifier.trim(),
                email: form.email.trim(),
              }
            : member,
        ),
      );
    } else {
      setMembers((current) => [
        {
          id: crypto.randomUUID(),
          fullName,
          identifier: form.identifier.trim(),
          email: form.email.trim(),
          isActive: true,
        },
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
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="mt-2 text-sm text-muted">
            Manage enrolled members and their faces.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddDialog}
          className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:w-auto"
        >
          <PlusIcon />
          Add member
        </button>
      </div>

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
          {filtered.length} of {members.length} members
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No members match “{query}”.
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium">Identifier</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-line/60 transition-colors last:border-0 hover:bg-surface-hover/40"
                  >
                    <td className="py-4 pr-4 font-medium">
                      {member.fullName}
                    </td>
                    <td className="py-4 pr-4 text-muted">
                      {member.identifier}
                    </td>
                    <td className="py-4 pr-4 text-muted">{member.email}</td>
                    <td className="py-4 pr-4">
                      <MemberStatusButton
                        member={member}
                        onToggle={() => toggleMember(member.id)}
                      />
                    </td>
                    <td className="py-4 text-right">
                      <MemberActions
                        member={member}
                        onEdit={() => openEditDialog(member)}
                        onDelete={() => removeMember(member.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 lg:hidden">
            {filtered.map((member) => (
              <li
                key={member.id}
                className="rounded-lg border border-line bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{member.fullName}</p>
                    {member.identifier && (
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {member.identifier}
                      </p>
                    )}
                    {member.email && (
                      <p className="truncate text-xs text-muted">
                        {member.email}
                      </p>
                    )}
                  </div>
                  <MemberActions
                    member={member}
                    onEdit={() => openEditDialog(member)}
                    onDelete={() => removeMember(member.id)}
                  />
                </div>
                <div className="mt-3">
                  <MemberStatusButton
                    member={member}
                    onToggle={() => toggleMember(member.id)}
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
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        aria-labelledby="member-dialog-title"
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-lg border border-line bg-surface p-0 text-foreground backdrop:bg-black/70"
      >
        <form onSubmit={submitMember}>
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2 id="member-dialog-title" className="text-sm font-semibold">
                {editingId ? "Edit member" : "Add member"}
              </h2>
              <p className="mt-1 text-xs text-muted">
                A face can be enrolled after saving.
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

          <div className="flex flex-col gap-4 px-5 py-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">Full name</span>
              <input
                name="fullName"
                required
                autoComplete="off"
                placeholder="Amara Okafor"
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">Identifier</span>
              <input
                name="identifier"
                autoComplete="off"
                placeholder="EMP-007"
                value={form.identifier}
                onChange={(event) => updateField("identifier", event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="off"
                placeholder="name@example.com"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className={fieldClass}
              />
            </label>
          </div>

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
              {editingId ? "Save changes" : "Add member"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

function MemberStatusButton({
  member,
  onToggle,
}: {
  member: Member;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={member.isActive}
      aria-label={`Toggle ${member.fullName} status`}
      title={member.isActive ? "Deactivate member" : "Activate member"}
      className={`-ml-1.5 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
        member.isActive ? "text-success" : "text-muted"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          member.isActive ? "bg-success" : "bg-muted"
        }`}
      />
      {member.isActive ? "Active" : "Inactive"}
    </button>
  );
}

function MemberActions({
  member,
  onEdit,
  onDelete,
}: {
  member: Member;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="inline-flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        title="Edit member"
        aria-label={`Edit ${member.fullName}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <PencilIcon />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${member.fullName}`}
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
