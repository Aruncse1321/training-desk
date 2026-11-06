import type { EnrollResponse, Session } from "../types";
import { formatTimeRange } from "../utils/format";
import PriceBreakdown from "./PriceBreakdown";
import StatusBadge from "./StatusBadge";

export default function EnrollResults({ response, sessions }: { response: EnrollResponse; sessions: Session[] }) {
  const nameOf = (id: number) => sessions.find((s) => s.id === id)?.name ?? `Session ${id}`;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4" aria-live="polite">
      <h2 className="mb-3 font-semibold">Result for {response.person.name}</h2>
      <ul className="space-y-3">
        {response.results.map((r) => (
          <li key={r.sessionId} className="rounded-md border border-slate-200 p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{nameOf(r.sessionId)}</span>
              {r.ok && r.enrollment ? (
                <StatusBadge status={r.enrollment.status} />
              ) : (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Rejected</span>
              )}
            </div>

            {r.ok && r.enrollment?.status === "confirmed" && (
              <div className="mt-2">
                <PriceBreakdown
                  price={{
                    original: r.enrollment.originalPrice,
                    discountName: r.enrollment.discountName,
                    discountAmount: r.enrollment.discountAmount,
                    amountDue: r.enrollment.amountDue,
                  }}
                />
              </div>
            )}

            {r.ok && r.enrollment?.status === "waitlisted" && (
              <p className="mt-2 text-slate-600">Session is full. On the waitlist, not charged.</p>
            )}

            {!r.ok && (
              <p className="mt-2 text-red-700">
                {r.message}
                {r.details?.clashesWith && (
                  <span className="block text-slate-600">
                    {r.details.clashesWith.name} runs {formatTimeRange(r.details.clashesWith.startsAt, r.details.clashesWith.endsAt)}.
                  </span>
                )}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}