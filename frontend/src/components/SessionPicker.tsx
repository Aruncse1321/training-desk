import type { Session } from "../types";
import { formatINR, formatTimeRange } from "../utils/format";

interface Props {
  sessions: Session[];
  selected: number[];
  onToggle: (id: number) => void;
  disabled?: boolean;
}

export default function SessionPicker({ sessions, selected, onToggle, disabled }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {sessions.map((s) => {
        const checked = selected.includes(s.id);
        return (
          <label
            key={s.id}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
              checked ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"
            } ${disabled ? "opacity-60" : ""}`}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-indigo-600"
              checked={checked}
              disabled={disabled}
              onChange={() => onToggle(s.id)}
            />
            <span className="flex-1 text-sm">
              <span className="flex items-center justify-between gap-2">
                <span className="font-medium">{s.name}</span>
                <span className="font-semibold">{formatINR(s.price)}</span>
              </span>
              <span className="block text-slate-500">
                {formatTimeRange(s.startsAt, s.endsAt)} · Room {s.room}
              </span>
              {s.full ? (
                <span className="mt-1 block font-medium text-amber-700">
                  Full · you will join the waitlist ({s.waitlisted} waiting)
                </span>
              ) : (
                <span className="mt-1 block text-green-700">
                  {s.seatsLeft} of {s.capacity} seats left
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}