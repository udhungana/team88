import { useT } from "@/i18n/useT";
import { useApp } from "@/context/AppContext";

function formatWhen(iso: string | undefined, na: string) {
  if (!iso) return na;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RemindersPanel() {
  const { t } = useT();
  const { scheduledReminders } = useApp();

  const sorted = [...scheduledReminders].sort((a, b) => {
    const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
    const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
    return ta - tb;
  });

  return (
    <div className="mx-auto max-w-md px-4 pb-36 pt-6 tablet:max-w-4xl tablet:px-6 tablet:pb-24 tablet:pt-8 lg:max-w-6xl lg:px-8 lg:pb-14 lg:pt-10">
      <header className="mb-6">
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-coral-500">
          {t("reminders_h")}
        </p>
        <h2 className="font-display text-2xl font-bold text-ink-950">{t("sched_title")}</h2>
        <p className="mt-1 text-sm text-ink-700">{t("sched_sub")}</p>
      </header>

      {sorted.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-mist-200">
          <p className="text-sm text-ink-700">{t("sched_empty")}</p>
        </div>
      ) : (
        <ul className="stagger-list grid grid-cols-1 gap-3 tablet:grid-cols-2 xl:grid-cols-3">
          {sorted.map((r) => (
            <li
              key={r.id}
              className="token-card hover-depth rounded-2xl bg-white p-4 ring-1 ring-mist-200"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-sea-600">
                {formatWhen(r.scheduledAt, t("time_na"))}
              </p>
              <p className="mt-1 font-semibold text-ink-950">{r.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-800">{r.starterSummary}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
