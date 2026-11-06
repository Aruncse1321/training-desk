import { useEffect, useState } from "react";
import { acceptOffer, cancelEnrollment, declineOffer, getEnrollments, getSessions } from "../api/endpoints";
import { ApiError } from "../api/client";
import type { EnrollmentRow, Session, Status } from "../types";
import EnrollmentCard from "../components/EnrollmentCard";
import { formatTimeRange } from "../utils/format";

const STATUSES: Status[] = ["confirmed", "waitlisted", "offered", "cancelled"];

const fieldClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

function errorText(e: unknown) {
  if (!(e instanceof ApiError)) return "Something went wrong";
  const clash = (e.details as { clashesWith?: { name: string } } | undefined)?.clashesWith;
  return clash ? `${e.message}. Person already has a confirmed seat in ${clash.name}.` : e.message;
}

export default function EnrollmentsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState<Status | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    getSessions().then(setSessions).catch(() => {});
  }, [refresh]);

  useEffect(() => {
    let ignore = false; // drops answers from out-of-date requests
    setLoading(true);
    getEnrollments({
      search: debounced,
      sessionId: sessionId ? Number(sessionId) : undefined,
      status: status || undefined,
    })
      .then((data) => {
        if (ignore) return;
        setRows(data);
        setError("");
      })
      .catch((e) => !ignore && setError(errorText(e)))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [debounced, sessionId, status, refresh]);

  async function run(id: number, action: (id: number) => Promise<unknown>) {
    setBusyId(id);
    setActionError("");
    try {
      await action(id);
      setRefresh((n) => n + 1);
    } catch (e) {
      setActionError(errorText(e));
    } finally {
      setBusyId(null);
    }
  }

  const onCancel = (r: EnrollmentRow) => {
    const msg =
      r.status === "confirmed"
        ? `Cancel ${r.person.name}'s seat in ${r.session.name}? The seat goes to the next person on the waitlist.`
        : `Cancel ${r.person.name}'s place in ${r.session.name}?`;
    if (window.confirm(msg)) run(r.id, cancelEnrollment);
  };

  const onDecline = (r: EnrollmentRow) => {
    if (window.confirm(`Decline the offered seat for ${r.person.name}? It goes to the next person waiting.`)) {
      run(r.id, declineOffer);
    }
  };

  const hasFilters = search !== "" || sessionId !== "" || status !== "";
  const clearFilters = () => {
    setSearch("");
    setDebounced("");
    setSessionId("");
    setStatus("");
  };

  // group rows under their session, in the order the server returned them
  const groups = rows.reduce<{ sessionId: number; name: string; items: EnrollmentRow[] }[]>((acc, r) => {
    const g = acc.find((x) => x.sessionId === r.session.id);
    if (g) g.items.push(r);
    else acc.push({ sessionId: r.session.id, name: r.session.name, items: [r] });
    return acc;
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="search" className="mb-1 block text-sm font-medium">Search</label>
          <input
            id="search"
            type="search"
            placeholder="Name, email or company"
            className={fieldClass}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="session" className="mb-1 block text-sm font-medium">Session</label>
          <select id="session" className={fieldClass} value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
            <option value="">All sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium">Status</label>
          <select id="status" className={`${fieldClass} capitalize`} value={status} onChange={(e) => setStatus(e.target.value as Status | "")}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasFilters}
            className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
          >
            Clear filters
          </button>
        </div>
      </div>

      {actionError && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{actionError}</p>
      )}
      {error && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}{" "}
          <button type="button" className="underline" onClick={() => setRefresh((n) => n + 1)}>Retry</button>
        </p>
      )}

      {loading && rows.length === 0 && !error && <p className="text-sm text-slate-500">Loading...</p>}
      {!loading && !error && groups.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          {hasFilters ? "No enrollments match these filters." : "No enrollments yet."}
        </p>
      )}

      {groups.map((g) => {
        const s = sessions.find((x) => x.id === g.sessionId);
        return (
          <section key={g.sessionId} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <header className="flex flex-col gap-1 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-semibold">{g.name}</h2>
              {s && (
                <p className="text-sm text-slate-600">
                  {formatTimeRange(s.startsAt, s.endsAt)} · Room {s.room} · {s.seatsTaken}/{s.capacity} seats
                  {s.waitlisted > 0 ? ` · ${s.waitlisted} waiting` : ""}
                </p>
              )}
            </header>
            <ul className="divide-y divide-slate-200">
              {g.items.map((r) => (
                <EnrollmentCard
                  key={r.id}
                  row={r}
                  busy={busyId === r.id}
                  onCancel={() => onCancel(r)}
                  onAccept={() => run(r.id, acceptOffer)}
                  onDecline={() => onDecline(r)}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}