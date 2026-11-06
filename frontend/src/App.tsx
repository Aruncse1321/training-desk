import { useState } from "react";
import EnrollPage from "./pages/EnrollPage";
type Tab = "enroll" | "enrollments";
import EnrollmentsPage from "./pages/EnrollmentsPage";

export default function App() {
  const [tab, setTab] = useState<Tab>("enroll");

  const tabClass = (t: Tab) =>
    `flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition ${tab === t ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold">Training Enrollment Desk</h1>
          <nav className="flex gap-2">
            <button className={tabClass("enroll")} onClick={() => setTab("enroll")}>
              Enroll a person
            </button>
            <button className={tabClass("enrollments")} onClick={() => setTab("enrollments")}>
              Enrollments
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === "enroll" ? <EnrollPage /> : <EnrollmentsPage />}
      </main>
    </div>
  );
}