import { useState } from "react";
import { createT } from "@/i18n/translations";
import type { CurrentUser, DisplayMode } from "@/types";
import { useApp } from "@/context/AppContext";
import { saveCredentials } from "@/lib/storage";

const te = createT("en");

const FEELING_CHIPS = [
  "Anxious",
  "Low",
  "Overwhelmed",
  "Lonely",
  "Hopeful",
  "Tired",
  "Calm",
  "Grateful",
];

function newUserId() {
  return `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function SignUpFlow() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState<0 | 1>(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("anonymous");
  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [feelingText, setFeelingText] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [region, setRegion] = useState("us");

  const addTagsFromInput = (raw: string) => {
    const parts = raw
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setTags((prev) => {
      let next = [...prev];
      for (const t of parts) {
        if (next.length >= 10) break;
        const lower = t.toLowerCase();
        if (next.some((x) => x.toLowerCase() === lower)) continue;
        next.push(t);
      }
      return next;
    });
    setTagInput("");
  };

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const canStep0 = username.trim().length >= 2 && password.length >= 4;
  const canFinish =
    tags.length > 0 &&
    feelingText.trim().length > 0 &&
    ethnicity.trim().length > 0 &&
    (displayMode === "anonymous" || legalName.trim().length > 0);

  const goStep1 = () => {
    if (!canStep0) return;
    setStep(1);
  };

  const finish = () => {
    const u: CurrentUser = {
      id: newUserId(),
      displayMode,
      legalName: displayMode === "named" ? legalName.trim() : undefined,
      displayName:
        displayMode === "anonymous"
          ? displayName.trim() || username.trim()
          : legalName.trim(),
      username: username.trim(),
      password,
      tags,
      feelingText: feelingText.trim(),
      ethnicity: ethnicity.trim(),
      region,
      moodEmoji: "🙂",
      moodText: "",
      lastMoodSubmittedAt: null,
      appLanguage: "en",
    };
    // Save credentials locally for persistent login
    saveCredentials({
      username: username.trim(),
      password,
    });
    completeOnboarding(u);
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-ink-900 via-ink-800 to-sea-600">
      <div className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-8 pt-8 lg:px-8 lg:pb-12 lg:pt-10">
        <div>
          <aside className="mb-8 rounded-[28px] bg-white/12 p-6 text-white shadow-soft ring-1 ring-white/20 backdrop-blur-sm lg:mb-0 lg:p-8">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              {te("together")}
            </p>
            <h1 className="font-display mt-4 text-3xl font-bold leading-tight lg:text-4xl">
              {step === 0 ? te("signup_title") : te("profile_title")}
            </h1>
            {step === 0 && (
              <p className="mt-2 text-sm font-medium text-white/85">{te("signup_sub")}</p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs lg:mt-8">
              <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/20">
                <p className="font-semibold">{te("stay_anon")}</p>
                <p className="mt-1 text-white/80">Private by default</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/20">
                <p className="font-semibold">{te("mood")}</p>
                <p className="mt-1 text-white/80">Match by how you feel</p>
              </div>
            </div>
          </aside>

          <section className="rounded-[28px] bg-white/12 p-5 text-white shadow-soft ring-1 ring-white/25 backdrop-blur-sm lg:mt-8 lg:p-7">
          {step === 0 && (
            <form
              className="flex flex-1 flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                goStep1();
              }}
            >
              <label className="block">
                <span className="text-sm font-medium text-white/90">{te("username")}</span>
                <input
                  className="mt-1 w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-white placeholder:text-white/55 shadow-sm outline-none ring-sea-300/30 focus:ring-2"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder={te("user_ph")}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white/90">{te("password")}</span>
                <input
                  type="password"
                  className="mt-1 w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-white placeholder:text-white/55 shadow-sm outline-none ring-sea-300/30 focus:ring-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder={te("pwd_ph")}
                />
              </label>
              <button
                type="submit"
                disabled={!canStep0}
                onClick={goStep1}
                className="mt-4 w-full rounded-2xl bg-sea-500 py-3.5 font-semibold text-white shadow-soft transition enabled:hover:bg-sea-600 disabled:cursor-not-allowed disabled:opacity-40 lg:max-w-xs"
              >
                {te("done")}
              </button>
            </form>
          )}

          {step === 1 && (
            <form
              className="flex flex-1 flex-col gap-5 lg:grid lg:grid-cols-2 lg:gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (canFinish) finish();
              }}
            >
              <div className="rounded-2xl border border-white/20 bg-white/8 p-4 shadow-sm lg:col-span-2">
                <p className="text-sm font-medium text-white/90">{te("identity")}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDisplayMode("anonymous")}
                    className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
                      displayMode === "anonymous"
                        ? "bg-sea-500 text-white"
                        : "bg-white/10 text-white/80"
                    }`}
                  >
                    {te("stay_anon")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayMode("named")}
                    className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
                      displayMode === "named"
                        ? "bg-sea-500 text-white"
                        : "bg-white/10 text-white/80"
                    }`}
                  >
                    {te("use_name")}
                  </button>
                </div>
                {displayMode === "named" ? (
                  <label className="mt-3 block">
                    <span className="text-xs text-white/75">{te("full_name")}</span>
                    <input
                      className="mt-1 w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm text-white outline-none ring-sea-300/30 focus:ring-2"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                    />
                  </label>
                ) : (
                  <label className="mt-3 block">
                    <span className="text-xs text-white/75">{te("display_name_opt")}</span>
                    <input
                      className="mt-1 w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/55 outline-none ring-sea-300/30 focus:ring-2"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={`Defaults to @${username || "username"}`}
                    />
                  </label>
                )}
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/8 p-4 shadow-sm lg:col-span-2">
                <p className="text-sm font-medium text-white/90">
                  {te("tags_title")}{" "}
                  <span className="font-normal text-white/70">{te("tags_max")}</span>
                </p>
                <p className="text-xs text-white/70">{te("tags_hint")}</p>
                <div className="mt-2 flex gap-2">
                  <input
                    className="min-w-0 flex-1 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/55 outline-none ring-sea-300/30 focus:ring-2"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTagsFromInput(tagInput);
                      }
                    }}
                    placeholder={te("tags_ph")}
                  />
                  <button
                    type="button"
                    onClick={() => addTagsFromInput(tagInput)}
                    className="rounded-xl bg-ink-800 px-4 py-2 text-sm font-medium text-white"
                  >
                    {te("add")}
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => removeTag(t)}
                      className="rounded-full bg-sea-400/25 px-3 py-1 text-xs font-medium text-sea-100"
                    >
                      {t} ×
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/8 p-4 shadow-sm lg:col-span-2">
                <p className="text-sm font-medium text-white/90">{te("feeling_now")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FEELING_CHIPS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setFeelingText((prev) =>
                          prev.includes(c) ? prev : prev ? `${prev}, ${c}` : c
                        )
                      }
                      className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 hover:border-sea-300"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <textarea
                  className="mt-2 w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none ring-sea-300/30 focus:ring-2"
                  rows={3}
                  value={feelingText}
                  onChange={(e) => setFeelingText(e.target.value)}
                  placeholder={te("feeling_ph")}
                />
              </div>

              <label className="block">
                <span className="text-sm font-medium text-white/90">{te("ethnicity")}</span>
                <input
                  className="mt-1 w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none ring-sea-300/30 focus:ring-2"
                  value={ethnicity}
                  onChange={(e) => setEthnicity(e.target.value)}
                  placeholder={te("ethnicity_ph")}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-white/90">{te("region_res")}</span>
                <select
                  className="mt-1 w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white outline-none ring-sea-300/30 focus:ring-2"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option className="bg-white text-ink-900" value="us">United States</option>
                  <option className="bg-white text-ink-900" value="uk">United Kingdom</option>
                  <option className="bg-white text-ink-900" value="ca">Canada</option>
                  <option className="bg-white text-ink-900" value="in">India</option>
                  <option className="bg-white text-ink-900" value="other">Other</option>
                </select>
              </label>

              <div className="mt-auto flex gap-3 pt-4 lg:col-span-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex-1 rounded-2xl border border-white/30 py-3.5 text-sm font-semibold text-white lg:max-w-40"
                >
                  {te("back")}
                </button>
                <button
                  type="submit"
                  disabled={!canFinish}
                  onClick={finish}
                  className="flex-[2] rounded-2xl bg-sea-500 py-3.5 text-sm font-semibold text-white shadow-soft transition enabled:hover:bg-sea-600 disabled:opacity-40 lg:max-w-64"
                >
                  {te("enter_app")}
                </button>
              </div>
            </form>
          )}
          </section>
        </div>
      </div>
    </div>
  );
}
