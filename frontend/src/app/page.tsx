import Link from "next/link";

const steps = [
  {
    step: "01",
    title: "Enroll once",
    body: "A member's face is captured a single time. Cognis keeps a numeric embedding — never the photo — so there is nothing to leak.",
  },
  {
    step: "02",
    title: "Scan at the door",
    body: "At an event, the check-in terminal matches the face against enrolled members and records attendance the moment it recognizes one.",
  },
  {
    step: "03",
    title: "Review the record",
    body: "Admins see who attended and when, per event. A repeat scan is reported as already checked in, never as a duplicate.",
  },
];

const guarantees = [
  {
    title: "Runs on your infrastructure",
    body: "Cognis is deployed by the organization that uses it. No third party sees your members or their attendance.",
  },
  {
    title: "No public sign-up",
    body: "There is no outside account to create. Members are added by an admin, and only they can check in.",
  },
  {
    title: "Biometrics stay server-side",
    body: "Embeddings are stored with the member record and never returned to a browser or written to a log.",
  },
  {
    title: "One model, validated",
    body: "The embedding model and its dimension are checked at every boundary, so a model change can never mix incompatible records.",
  },
];

const specs = [
  { label: "Deployment", value: "Private, organization-owned" },
  { label: "Check-in", value: "Face scan at the event terminal" },
  { label: "Stored", value: "Embeddings and attendance only" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex w-full items-center border-b border-line px-6 py-6 sm:px-10">
        <span className="text-sm font-semibold tracking-tight">cognis</span>
      </header>

      <main className="flex w-full flex-1 flex-col">
        <section className="grid w-full gap-12 border-b border-line px-6 py-20 sm:px-10 sm:py-28 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-20">
          <div className="flex flex-col gap-8">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Face-recognition attendance
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Attendance, without the clipboard.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted sm:text-lg">
              Cognis is a private attendance system your organization runs
              itself. Members enroll once, then check in to an event with a
              glance at the camera — no forms, no queue at the door.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <Link
                href="/admin"
                className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-muted"
              >
                Open admin console
              </Link>
              <a
                href="#how"
                className="inline-flex h-11 items-center justify-center rounded-full border border-line px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                How check-in works
              </a>
            </div>
          </div>

          <dl className="flex flex-col divide-y divide-line text-sm">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-baseline justify-between gap-6 py-3 first:pt-0 last:pb-0"
              >
                <dt className="shrink-0 text-xs uppercase tracking-[0.14em] text-muted">
                  {spec.label}
                </dt>
                <dd className="text-right text-foreground">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="how" className="flex w-full flex-col border-b border-line">
          <div className="flex flex-col gap-2 px-6 pt-16 pb-10 sm:px-10 sm:pt-20">
            <h2 className="text-sm font-medium">How it works</h2>
            <p className="max-w-lg text-sm leading-6 text-muted">
              Three steps, from enrolling a member to reading the report.
            </p>
          </div>
          <ol className="grid w-full border-t border-line sm:grid-cols-3">
            {steps.map((item, index) => (
              <li
                key={item.step}
                className={`flex flex-col gap-3 border-b border-line px-6 py-8 last:border-b-0 sm:border-b-0 sm:px-10 sm:py-10 ${
                  index < steps.length - 1 ? "sm:border-r" : ""
                }`}
              >
                <span className="font-mono text-xs text-muted">
                  {item.step}
                </span>
                <h3 className="text-base font-medium">{item.title}</h3>
                <p className="text-sm leading-6 text-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex w-full flex-col">
          <div className="flex flex-col gap-2 px-6 pt-16 pb-10 sm:px-10 sm:pt-20">
            <h2 className="text-sm font-medium">Built for private deployments</h2>
            <p className="max-w-lg text-sm leading-6 text-muted">
              This is not a public website. It is an internal terminal for one
              organization and its members.
            </p>
          </div>
          <dl className="grid w-full border-t border-line sm:grid-cols-2">
            {guarantees.map((item, index) => (
              <div
                key={item.title}
                className={`flex flex-col gap-2 border-b border-line px-6 py-8 sm:px-10 sm:py-10 ${
                  index % 2 === 0 ? "sm:border-r" : ""
                }`}
              >
                <dt className="text-sm font-medium">{item.title}</dt>
                <dd className="text-sm leading-6 text-muted">{item.body}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="flex w-full flex-col gap-2 border-t border-line px-6 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <span>cognis — internal attendance terminal</span>
      </footer>
    </div>
  );
}
