import { useState } from "react";
import { createT } from "@/i18n/translations";
import type { CurrentUser, DisplayMode } from "@/types";
import { useApp } from "@/context/AppContext";

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
    completeOnboarding(u);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-12">
      <div className="mb-8">
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-sea-600">
          {te("together")}
        </p>
        <h1 className="font-display mt-1 text-3xl font-bold text-ink-950">
          {step === 0 ? te("signup_title") : te("profile_title")}
        </h1>
        <p className="mt-2 text-sm text-ink-700">{te("signup_sub")}</p>
      </div>

      {step === 0 && (
        <div className="flex flex-1 flex-col gap-4">
          <label className="block">
            <span className="text-sm font-medium text-ink-800">{te("username")}</span>
            <input
              className="mt-1 w-full rounded-2xl border border-mist-200 bg-white px-4 py-3 text-ink-950 shadow-sm outline-none ring-sea-500/30 focus:ring-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder={te("user_ph")}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-800">{te("password")}</span>
            <input
              type="password"
              className="mt-1 w-full rounded-2xl border border-mist-200 bg-white px-4 py-3 text-ink-950 shadow-sm outline-none ring-sea-500/30 focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder={te("pwd_ph")}
            />
          </label>
          <button
            type="button"
            disabled={!canStep0}
            onClick={() => setStep(1)}
            className="mt-4 w-full rounded-2xl bg-sea-500 py-3.5 font-semibold text-white shadow-soft transition enabled:hover:bg-sea-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {te("done")}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-1 flex-col gap-5">
          <div className="rounded-2xl border border-mist-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-ink-800">{te("identity")}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setDisplayMode("anonymous")}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
                  displayMode === "anonymous"
                    ? "bg-sea-500 text-white"
                    : "bg-mist-100 text-ink-700"
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
                    : "bg-mist-100 text-ink-700"
                }`}
              >
                {te("use_name")}
              </button>
            </div>
            {displayMode === "named" ? (
              <label className="mt-3 block">
                <span className="text-xs text-ink-700">{te("full_name")}</span>
                <input
                  className="mt-1 w-full rounded-xl border border-mist-200 px-3 py-2 text-sm outline-none ring-sea-500/30 focus:ring-2"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                />
              </label>
            ) : (
              <label className="mt-3 block">
                <span className="text-xs text-ink-700">{te("display_name_opt")}</span>
                <input
                  className="mt-1 w-full rounded-xl border border-mist-200 px-3 py-2 text-sm outline-none ring-sea-500/30 focus:ring-2"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={`Defaults to @${username || "username"}`}
                />
              </label>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-ink-800">
              {te("tags_title")}{" "}
              <span className="font-normal text-ink-700">{te("tags_max")}</span>
            </p>
            <p className="text-xs text-ink-600">{te("tags_hint")}</p>
            <div className="mt-2 flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-xl border border-mist-200 bg-white px-3 py-2 text-sm outline-none ring-sea-500/30 focus:ring-2"
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
                  className="rounded-full bg-sea-500/15 px-3 py-1 text-xs font-medium text-sea-600"
                >
                  {t} ×
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink-800">{te("feeling_now")}</p>
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
                  className="rounded-full border border-mist-200 bg-white px-3 py-1 text-xs font-medium text-ink-800 hover:border-sea-400"
                >
                  {c}
                </button>
              ))}
            </div>
            <textarea
              className="mt-2 w-full rounded-2xl border border-mist-200 bg-white px-4 py-3 text-sm outline-none ring-sea-500/30 focus:ring-2"
              rows={3}
              value={feelingText}
              onChange={(e) => setFeelingText(e.target.value)}
              placeholder={te("feeling_ph")}
            />
          </div>

          <label className="block">
            <span className="text-sm font-medium text-ink-800">{te("ethnicity")}</span>
            <input
              className="mt-1 w-full rounded-2xl border border-mist-200 bg-white px-4 py-3 text-sm outline-none ring-sea-500/30 focus:ring-2"
              value={ethnicity}
              onChange={(e) => setEthnicity(e.target.value)}
              placeholder={te("ethnicity_ph")}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink-800">{te("region_res")}</span>
            <select
              className="mt-1 w-full rounded-2xl border border-mist-200 bg-white px-4 py-3 text-sm outline-none ring-sea-500/30 focus:ring-2"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="ca">Canada</option>
              <option value="in">India</option>
              <option value="other">Other</option>
            </select>
          </label>

          <div className="mt-auto flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex-1 rounded-2xl border border-mist-200 py-3.5 text-sm font-semibold text-ink-800"
            >
              {te("back")}
            </button>
            <button
              type="button"
              disabled={!canFinish}
              onClick={finish}
              className="flex-[2] rounded-2xl bg-sea-500 py-3.5 text-sm font-semibold text-white shadow-soft transition enabled:hover:bg-sea-600 disabled:opacity-40"
            >
              {te("enter_app")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
