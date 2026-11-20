"use client";

import {
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";

import { createId } from "@/lib/id";
import { ConfirmDialog } from "../_components/confirm-dialog";
import { PlusIcon, RotateIcon, XIcon } from "../_components/icons";
import { RowActions } from "../_components/row-actions";
import { mockDevices, type Device } from "../_data/devices";
import { formatDateTime } from "../_lib/datetime";
import {
  createAccessToken,
  formatValidity,
  isTokenExpired,
  maskAccessToken,
  nowValue,
  tokenExpiresAt,
  validityLimits,
} from "../_lib/devices";

const fieldClass =
  "w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-muted focus:outline-none";

const emptyForm = { name: "", description: "", validityDays: "30" };

const clockIntervalMs = 60_000;

function subscribeToClock(onChange: () => void) {
  const id = setInterval(onChange, clockIntervalMs);
  return () => clearInterval(id);
}

function getServerNow() {
  return null;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState(mockDevices);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const now = useSyncExternalStore(subscribeToClock, nowValue, getServerNow);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Device | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return devices;

    return devices.filter((device) =>
      [device.name, device.description].some((value) =>
        value.toLowerCase().includes(q),
      ),
    );
  }, [devices, query]);

  function removeDevice(id: string) {
    setDevices((current) => current.filter((device) => device.id !== id));
  }

  function issueToken(id: string) {
    setDevices((current) =>
      current.map((device) =>
        device.id === id
          ? {
              ...device,
              accessToken: createAccessToken(),
              tokenIssuedAt: nowValue(),
            }
          : device,
      ),
    );
  }

  function openAddDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    showDialog();
  }

  function openEditDialog(device: Device) {
    setEditingId(device.id);
    setForm({
      name: device.name,
      description: device.description,
      validityDays: String(device.tokenValidityDays),
    });
    setFormError("");
    showDialog();
  }

  function showDialog() {
    dialogRef.current?.showModal();
    dialogRef.current
      ?.querySelector<HTMLInputElement>('input[name="deviceName"]')
      ?.focus();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
  }

  function submitDevice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    if (!name) {
      setFormError("Enter the device's name.");
      return;
    }

    const duplicateName = devices.some(
      (device) =>
        device.id !== editingId &&
        device.name.toLowerCase() === name.toLowerCase(),
    );

    if (duplicateName) {
      setFormError(`Another device is already named ${name}.`);
      return;
    }

    const validityDays = Number(form.validityDays);
    if (
      !Number.isInteger(validityDays) ||
      validityDays < validityLimits.min ||
      validityDays > validityLimits.max
    ) {
      setFormError(
        `Validity must be a whole number of days between ${validityLimits.min} and ${validityLimits.max}.`,
      );
      return;
    }

    const values = {
      name,
      description: form.description.trim(),
      tokenValidityDays: validityDays,
    };

    if (editingId) {
      setDevices((current) =>
        current.map((device) =>
          device.id === editingId ? { ...device, ...values } : device,
        ),
      );
    } else {
      setDevices((current) => [
        {
          id: createId(),
          ...values,
          accessToken: createAccessToken(),
          tokenIssuedAt: nowValue(),
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
          <h1 className="text-2xl font-semibold tracking-tight">Devices</h1>
          <p className="mt-2 text-sm text-muted">
            Manage the cameras that submit attendance and their access tokens.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddDialog}
          className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:w-auto"
        >
          <PlusIcon />
          Add device
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">Search devices</span>
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
          {filtered.length} of {devices.length} devices
        </p>
      </div>

      {devices.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No devices yet. Add your first device to get started.
        </p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No devices match “{query}”.
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-3 font-medium">Device</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Token validity</th>
                  <th className="pb-3 font-medium">Token</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((device) => (
                  <tr
                    key={device.id}
                    className="border-b border-line/60 transition-colors last:border-0 hover:bg-surface-hover/40"
                  >
                    <td className="py-4 pr-4 font-medium">{device.name}</td>
                    <td className="py-4 pr-4">
                      <p className="max-w-[240px] truncate text-muted">
                        {device.description}
                      </p>
                    </td>
                    <td className="py-4 pr-4 text-muted">
                      {formatValidity(device.tokenValidityDays)}
                    </td>
                    <td className="py-4 pr-4">
                      <TokenCell device={device} now={now} />
                    </td>
                    <td className="py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <TokenAction
                          device={device}
                          now={now}
                          onIssue={() => issueToken(device.id)}
                        />
                        <RowActions
                          label={device.name}
                          onEdit={() => openEditDialog(device)}
                          onDelete={() => setPendingDelete(device)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 lg:hidden">
            {filtered.map((device) => (
              <li
                key={device.id}
                className="rounded-lg border border-line bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{device.name}</p>
                    {device.description && (
                      <p className="mt-0.5 text-xs text-muted">
                        {device.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted">
                      Token valid for {formatValidity(device.tokenValidityDays)}
                    </p>
                  </div>
                  <RowActions
                    label={device.name}
                    onEdit={() => openEditDialog(device)}
                    onDelete={() => setPendingDelete(device)}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <TokenCell device={device} now={now} />
                  <TokenAction
                    device={device}
                    now={now}
                    onIssue={() => issueToken(device.id)}
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
          setFormError("");
          setEditingId(null);
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        aria-labelledby="device-dialog-title"
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-lg border border-line bg-surface p-0 text-foreground backdrop:bg-black/70"
      >
        <form onSubmit={submitDevice}>
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2 id="device-dialog-title" className="text-sm font-semibold">
                {editingId ? "Edit device" : "Add device"}
              </h2>
              <p className="mt-1 text-xs text-muted">
                {editingId
                  ? "Validity applies from the last token issue."
                  : "A token is issued when the device is saved."}
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
              <span className="text-xs text-muted">Name</span>
              <input
                name="deviceName"
                required
                autoComplete="off"
                placeholder="Front desk kiosk"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">Description</span>
              <textarea
                name="description"
                rows={3}
                placeholder="Where the device is installed"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">
                Access token validity (days)
              </span>
              <input
                name="validityDays"
                type="number"
                required
                min={validityLimits.min}
                max={validityLimits.max}
                step={1}
                inputMode="numeric"
                value={form.validityDays}
                onChange={(event) =>
                  updateField("validityDays", event.target.value)
                }
                className={fieldClass}
              />
            </label>
            {formError && <p className="text-xs text-danger">{formError}</p>}
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
              {editingId ? "Save changes" : "Add device"}
            </button>
          </div>
        </form>
      </dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name ?? "device"}?`}
        description="The device's access token stops working and it can no longer submit attendance."
        confirmLabel="Delete device"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) removeDevice(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function TokenCell({
  device,
  now,
}: {
  device: Device;
  now: string | null;
}) {
  const expired = isTokenExpired(device, now);
  const expiresAt = formatDateTime(tokenExpiresAt(device));

  return (
    <div className="flex flex-col gap-0.5">
      <code className="font-mono text-xs">{maskAccessToken(device.accessToken)}</code>
      <span className={`text-xs ${expired ? "text-danger" : "text-muted"}`}>
        {expired ? "Expired" : "Expires"} {expiresAt}
      </span>
    </div>
  );
}

function TokenAction({
  device,
  now,
  onIssue,
}: {
  device: Device;
  now: string | null;
  onIssue: () => void;
}) {
  const expired = isTokenExpired(device, now);
  const label = expired ? "Re-generate" : "Rotate";

  return (
    <button
      type="button"
      onClick={onIssue}
      title={
        expired
          ? "Issue a fresh token for this device"
          : "Rotate the token and restart its lifetime"
      }
      aria-label={`${label} access token for ${device.name}`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      <RotateIcon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
