import { useEffect, useState } from "react";
import { generateConversationStarters } from "@/lib/starters";
import { fetchFirstConversationStarters, isOpenAiConfigured } from "@/lib/openai";
import type { ConversationStarter, FirstConversationInputs } from "@/types";
import { useApp } from "@/context/AppContext";
import { useT } from "@/i18n/useT";

const OUTPUT_LANGS = ["English", "Nepali", "Spanish", "Hindi", "French", "Arabic", "Other"];

export function FirstConversation() {
  const { t } = useT();
  const { addReminder, firstConvo: fc, patchFirstConvo, currentUser } = useApp();
  const [toast, setToast] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (currentUser?.appLanguage === "ne" && fc.language !== "Nepali") {
      patchFirstConvo({ language: "Nepali" });
    }
  }, [currentUser?.appLanguage, fc.language, patchFirstConvo]);

  const goPlan = () => patchFirstConvo({ phase: "plan" });
  const goFeel = () => patchFirstConvo({ phase: "feel" });

  const goResults = async () => {
    const selectedLanguage =
      currentUser?.appLanguage === "ne" ? "Nepali" : fc.language;

    const input: FirstConversationInputs = {
      feeling: fc.feeling,
      audience: fc.audience,
      topics: fc.topics,
      language: selectedLanguage,
      cultureRegion: fc.cultureRegion,
      timePreference: fc.timePreference,
    };

    setGenerating(true);
    try {
      const starters = isOpenAiConfigured()
        ? await fetchFirstConversationStarters(input)
        : generateConversationStarters(input);

      patchFirstConvo({
        starters,
        phase: "results",
      });
    } catch {
      patchFirstConvo({
        starters: generateConversationStarters(input),
        phase: "results",
      });
      setToast("AI unavailable. Showing template starters.");
      setTimeout(() => setToast(null), 2500);
    } finally {
      setGenerating(false);
    }
  };

  const scheduleStub = (starter: ConversationStarter) => {
    const when = new Date(fc.reminderWhen);
    const whenLabel = Number.isNaN(when.getTime())
      ? fc.reminderWhen
      : when.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    addReminder({
      label: `Talk — ${whenLabel}`,
      starterSummary: starter.text.slice(0, 200) + (starter.text.length > 200 ? "…" : ""),
      audience: fc.audience,
      scheduledAt: fc.reminderWhen,
    });

    patchFirstConvo({
      starters: fc.starters.filter((s) => s.id !== starter.id),
      expandedId: fc.expandedId === starter.id ? null : fc.expandedId,
    });

    setToast(t("toast_remind"));
    setTimeout(() => setToast(null), 2800);
  };

  return (
    <div className="mx-auto max-w-md px-4 pb-32 pt-6 tablet:max-w-4xl tablet:px-6 tablet:pb-22 tablet:pt-8 lg:max-w-6xl lg:px-8 lg:pb-14 lg:pt-10">
      <header className="mb-6">
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-coral-500">
          {t("first_word")}
        </p>
        <h2 className="font-display text-2xl font-bold text-ink-950">{t("first_title")}</h2>
        <p className="mt-2 text-sm text-ink-700">{t("first_sub")}</p>
        <p className="mt-1 text-xs text-ink-600">{t("first_desc_short")}</p>
      </header>

      {fc.phase === "feel" && (
        <div className="section-fade space-y-4 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-mist-200 tablet:grid tablet:grid-cols-2 tablet:gap-4 tablet:space-y-0 lg:gap-5 lg:p-6">
          <label className="block">
            <span className="text-sm font-medium text-ink-800">{t("what_feeling")}</span>
            <textarea
              className="mt-2 w-full rounded-2xl border border-mist-200 px-4 py-3 text-sm outline-none ring-sea-500/30 focus:ring-2"
              rows={4}
              value={fc.feeling}
              onChange={(e) => patchFirstConvo({ feeling: e.target.value })}
              placeholder={t("feeling_long_ph")}
            />
          </label>
          <div className="lg:flex lg:flex-col lg:justify-between">
            <p className="text-sm font-medium text-ink-800">{t("who_talk")}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  ["family", "family"],
                  ["friends", "friend"],
                ] as const
              ).map(([id, key]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => patchFirstConvo({ audience: id })}
                  className={`rounded-2xl py-2.5 text-sm font-semibold transition ${
                    fc.audience === id ? "bg-sea-500 text-white" : "bg-mist-100 text-ink-800"
                  }`}
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={goPlan}
            className="w-full rounded-2xl bg-ink-900 py-3.5 text-sm font-semibold text-white lg:col-span-2"
          >
            {t("plan_talk")}
          </button>
        </div>
      )}

      {fc.phase === "plan" && (
        <div className="section-fade space-y-4 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-mist-200 tablet:grid tablet:grid-cols-2 tablet:gap-4 tablet:space-y-0 lg:p-6">
          <p className="font-display text-lg font-semibold text-ink-950">{t("plan_your")}</p>
          <label className="block">
            <span className="text-sm font-medium text-ink-800">{t("usual_topics")}</span>
            <input
              className="mt-2 w-full rounded-2xl border border-mist-200 px-4 py-3 text-sm outline-none ring-sea-500/30 focus:ring-2"
              value={fc.topics}
              onChange={(e) => patchFirstConvo({ topics: e.target.value })}
              placeholder={t("topics_ph")}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-800">{t("output_lang")}</span>
            <select
              className="mt-2 w-full rounded-2xl border border-mist-200 px-4 py-3 text-sm outline-none ring-sea-500/30 focus:ring-2"
              value={fc.language}
              onChange={(e) => patchFirstConvo({ language: e.target.value })}
            >
              {OUTPUT_LANGS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-800">{t("region_culture")}</span>
            <input
              className="mt-2 w-full rounded-2xl border border-mist-200 px-4 py-3 text-sm outline-none ring-sea-500/30 focus:ring-2"
              value={fc.cultureRegion}
              onChange={(e) => patchFirstConvo({ cultureRegion: e.target.value })}
              placeholder={t("culture_ph")}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-800">{t("pref_time")}</span>
            <select
              className="mt-2 w-full rounded-2xl border border-mist-200 px-4 py-3 text-sm outline-none ring-sea-500/30 focus:ring-2"
              value={fc.timePreference}
              onChange={(e) => patchFirstConvo({ timePreference: e.target.value })}
            >
              <option value="this morning">{t("morning")}</option>
              <option value="this afternoon">{t("afternoon")}</option>
              <option value="this evening">{t("evening")}</option>
              <option value="tomorrow">{t("tomorrow")}</option>
            </select>
          </label>
          <div className="flex gap-2 lg:col-span-2">
            <button
              type="button"
              onClick={goFeel}
              className="flex-1 rounded-2xl border border-mist-200 py-3 text-sm font-semibold"
            >
              {t("back")}
            </button>
            <button
              type="button"
              onClick={() => void goResults()}
              disabled={generating}
              className="flex-[2] rounded-2xl bg-sea-500 py-3 text-sm font-semibold text-white"
            >
              {generating ? "Generating..." : t("get_starters")}
            </button>
          </div>
        </div>
      )}

      {fc.phase === "results" && (
        <div className="section-fade space-y-3 lg:space-y-4">
          <button
            type="button"
            onClick={() => patchFirstConvo({ phase: "plan" })}
            className="text-sm font-semibold text-sea-600"
          >
            {t("edit_inputs")}
          </button>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-mist-200">
            <label className="block">
              <span className="text-sm font-semibold text-ink-900">{t("remind_dt")}</span>
              <p className="mt-1 text-xs text-ink-600">{t("remind_help")}</p>
              <input
                type="datetime-local"
                className="mt-3 w-full rounded-xl border border-mist-200 px-3 py-2.5 text-sm outline-none ring-sea-500/30 focus:ring-2"
                value={fc.reminderWhen}
                onChange={(e) => patchFirstConvo({ reminderWhen: e.target.value })}
              />
            </label>
          </div>

          <ul className="stagger-list grid grid-cols-1 gap-3 tablet:grid-cols-2">
            {fc.starters.map((s) => (
              <li
                key={s.id}
                className="token-card hover-depth rounded-3xl bg-white p-4 ring-1 ring-mist-200"
              >
                <p
                  className={`text-sm leading-relaxed text-ink-900 ${
                    fc.language === "Nepali" ? "font-[system-ui]" : ""
                  }`}
                  lang={fc.language === "Nepali" ? "ne" : "en"}
                >
                  {s.text}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    patchFirstConvo({
                      expandedId: fc.expandedId === s.id ? null : s.id,
                    })
                  }
                  className="mt-2 text-xs font-semibold text-sea-600"
                >
                  {fc.expandedId === s.id ? t("hide_why") : t("why_works")}
                </button>
                {fc.expandedId === s.id && (
                  <p
                    className="mt-2 rounded-2xl bg-mist-100 p-3 text-xs text-ink-800"
                    lang={fc.language === "Nepali" ? "ne" : "en"}
                  >
                    {s.whyItWorks}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => scheduleStub(s)}
                  className="mt-3 w-full rounded-2xl border border-sea-500/40 py-2.5 text-xs font-semibold text-sea-600"
                >
                  {t("remind_starter")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-28 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-2xl bg-ink-900 px-4 py-3 text-center text-xs font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
