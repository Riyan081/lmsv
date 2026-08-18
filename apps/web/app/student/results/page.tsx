import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";

export default async function StudentResultsPage() {
  const res = await api.get("/api/exams/results/my");
  const data = res.data;
  const results = data?.results || [];
  const sgpa = data?.sgpa || {};
  const cgpa = data?.cgpa || 0;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="My Results"
        description="View your exam results and academic performance."
      />

      {/* CGPA Card */}
      <div className="rounded-2xl border p-6 mb-6" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Cumulative GPA</p>
            <p className="text-5xl font-bold tracking-tight mt-1 gradient-text">{cgpa}</p>
          </div>
          <div className="flex gap-4">
            {Object.entries(sgpa).map(([sem, gpa]) => (
              <div key={sem} className="text-center">
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Sem {sem}</p>
                <p className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>{gpa as number}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Table */}
      {results.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No results available yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Subject</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Exam</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Marks</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r: any, i: number) => {
                const percentage = r.exam?.totalMarks ? (r.marksObtained / r.exam.totalMarks) * 100 : 0;
                return (
                  <tr key={i} className="border-b last:border-b-0 hover:bg-white/[0.02] transition-colors" style={{ borderColor: "var(--color-border)" }}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{r.subject?.name}</p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{r.subject?.code} · {r.subject?.credits} credits</p>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {r.exam?.name}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        {r.marksObtained}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        /{r.exam?.totalMarks}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                          percentage >= 80 ? "bg-emerald-500/10 text-emerald-400" :
                          percentage >= 60 ? "bg-blue-500/10 text-blue-400" :
                          percentage >= 40 ? "bg-amber-500/10 text-amber-400" :
                          "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {r.grade || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
