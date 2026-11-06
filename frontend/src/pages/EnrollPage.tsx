import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { enroll, getSessions } from "../api/endpoints";
import { ApiError } from "../api/client";
import type { EnrollResponse, Session } from "../types";
import SessionPicker from "../components/SessionPicker";
import EnrollResults from "../components/EnrollResults";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export default function EnrollPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadError, setLoadError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<EnrollResponse | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setSessions(await getSessions());
      setLoadError("");
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "Could not load sessions");
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const toggle = (id: number) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Name is required");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email");
    if (!company.trim()) return setError("Company is required");
    if (selected.length === 0) return setError("Pick at least one session");

    setSubmitting(true);
    try {
      const res = await enroll({ name, email, company, sessionIds: selected });
      setResponse(res);
      setSelected([]);         // keep person details so more sessions can be added
      await loadSessions();    // seat counts changed
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setName("");
    setEmail("");
    setCompany("");
    setSelected([]);
    setError("");
    setResponse(null);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 sm:p-6" noValidate>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label>
            <input id="name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="company" className="mb-1 block text-sm font-medium">Company</label>
            <input id="company" className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="off" />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-medium">Sessions</h2>
          {loadError ? (
            <p className="text-sm text-red-700">
              {loadError}{" "}
              <button type="button" onClick={loadSessions} className="underline">Retry</button>
            </p>
          ) : (
            <SessionPicker sessions={sessions} selected={selected} onToggle={toggle} disabled={submitting} />
          )}
        </div>

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Enrolling..." : "Enroll"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={submitting}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-60"
          >
            Enroll another person
          </button>
        </div>
      </form>

      {response && <EnrollResults response={response} sessions={sessions} />}
    </div>
  );
}