import { useCallback, useEffect, useState } from "react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/context/AppContext";
import type { AppLocale } from "@/types";

const MAX_TAGS_TOTAL = 10;

function partitionThree<T>(arr: T[]): [T[], T[], T[]] {
  const a: T[] = [];
  const b: T[] = [];
  const c: T[] = [];
  arr.forEach((item, i) => {
    if (i % 3 === 0) a.push(item);
    else if (i % 3 === 1) b.push(item);
    else c.push(item);
  });
  return [a, b, c];
}

function capSections(
  interests: string[],
  hobbies: string[],
  professions: string[]
): { tags: string[]; sections: { interests: string[]; hobbies: string[]; professions: string[] } } {
  const i = [...interests];
  const h = [...hobbies];
  const p = [...professions];
  let total = i.length + h.length + p.length;
  while (total > MAX_TAGS_TOTAL) {
    if (p.length) p.pop();
    else if (h.length) h.pop();
    else i.pop();
    total--;
  }
  return { tags: [...i, ...h, ...p], sections: { interests: i, hobbies: h, professions: p } };
}

export function ProfilePanel() {
  const { t } = useT();
  const { currentUser, setCurrentUser } = useApp();
  const [lang, setLang] = useState<AppLocale>(currentUser?.appLanguage ?? "en");
  const [savedLang, setSavedLang] = useState(false);
  const [savedTags, setSavedTags] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);

  useEffect(() => {
    setLang(currentUser?.appLanguage ?? "en");
  }, [currentUser?.appLanguage]);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.tagSections) {
      setInterests([...currentUser.tagSections.interests]);
      setHobbies([...currentUser.tagSections.hobbies]);
      setProfessions([...currentUser.tagSections.professions]);
      return;
    }
    const [a, b, c] = partitionThree(currentUser.tags);
    setInterests(a);
    setHobbies(b);
    setProfessions(c);
  }, [
    currentUser?.id,
    currentUser?.tagSections
      ? [
          currentUser.tagSections.interests.join("\u0001"),
          currentUser.tagSections.hobbies.join("\u0001"),
          currentUser.tagSections.professions.join("\u0001"),
        ].join("\u0002")
      : currentUser?.tags.join("\u0001"),
  ]);

  const allTags = [...interests, ...hobbies, ...professions];
  const atCap = allTags.length >= MAX_TAGS_TOTAL;

  const tryAdd = useCallback(
    (section: "interests" | "hobbies" | "professions", raw: string) => {
      const tag = raw.trim();
      if (!tag) return;
      const flat = [...interests, ...hobbies, ...professions];
      if (flat.length >= MAX_TAGS_TOTAL) return;
      if (flat.some((x) => x.toLowerCase() === tag.toLowerCase())) return;
      if (section === "interests") setInterests((s) => [...s, tag]);
      else if (section === "hobbies") setHobbies((s) => [...s, tag]);
      else setProfessions((s) => [...s, tag]);
    },
    [interests, hobbies, professions]
  );

  const removeFrom = useCallback(
    (section: "interests" | "hobbies" | "professions", tag: string) => {
      const pred = (x: string) => x !== tag;
      if (section === "interests") setInterests((s) => s.filter(pred));
      else if (section === "hobbies") setHobbies((s) => s.filter(pred));
      else setProfessions((s) => s.filter(pred));
    },
    []
  );

  if (!currentUser) return null;

  const saveLanguage = () => {
    setCurrentUser({ ...currentUser, appLanguage: lang });
    setSavedLang(true);
    window.setTimeout(() => setSavedLang(false), 2000);
  };

  const saveTags = () => {
    const { tags, sections } = capSections(interests, hobbies, professions);
    setInterests(sections.interests);
    setHobbies(sections.hobbies);
    setProfessions(sections.professions);
    setCurrentUser({ ...currentUser, tags, tagSections: sections });
    setSavedTags(true);
    window.setTimeout(() => setSavedTags(false), 2000);
  };

  return (
    <div className="mx-auto max-w-md px-4 pb-32 pt-6 tablet:max-w-4xl tablet:px-6 tablet:pb-22 tablet:pt-8 lg:max-w-6xl lg:px-8 lg:pb-14 lg:pt-10">
      <header className="mb-6">
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-coral-500">
          {t("nav_profile")}
        </p>
        <h2 className="font-display text-2xl font-bold text-ink-950">{t("profile_page")}</h2>
        <p className="mt-1 text-sm text-ink-700">{t("profile_sub")}</p>
      </header>

      <div className="token-panel section-fade space-y-4 rounded-3xl bg-white p-5 ring-1 ring-mist-200 tablet:max-w-2xl lg:max-w-xl lg:p-6">
        <div>
          <p className="text-sm font-semibold text-ink-900">{t("profile_lang")}</p>
          <p className="mt-1 text-xs text-ink-600">{t("profile_lang_sub")}</p>
          <select
            className="mt-3 w-full rounded-2xl border border-mist-200 px-4 py-3 text-sm outline-none ring-sea-500/30 focus:ring-2"
            value={lang}
            onChange={(e) => setLang(e.target.value as AppLocale)}
          >
            <option value="en">English</option>
            <option value="ne">नेपाली (Nepali)</option>
          </select>
          <button
            type="button"
            onClick={saveLanguage}
            className="mt-3 w-full rounded-2xl bg-sea-500 py-3 text-sm font-semibold text-white"
          >
            {t("save_lang")}
          </button>
          {savedLang && (
            <p className="mt-2 text-center text-xs font-medium text-sage-600">{t("lang_saved")}</p>
          )}
        </div>
      </div>

      <div className="mt-6 tablet:grid tablet:grid-cols-1 tablet:gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-6 lg:items-start">
        <div className="space-y-5">
        <EditableTagSection
          title={t("interests_sec")}
          empty={t("none_yet")}
          items={interests}
          onAdd={(raw) => tryAdd("interests", raw)}
          onRemove={(tag) => removeFrom("interests", tag)}
          atCap={atCap}
          tagPh={t("tag_add_ph")}
          addLabel={t("add")}
          removeAria={t("remove_tag")}
        />
        <EditableTagSection
          title={t("hobbies_sec")}
          empty={t("none_yet")}
          items={hobbies}
          onAdd={(raw) => tryAdd("hobbies", raw)}
          onRemove={(tag) => removeFrom("hobbies", tag)}
          atCap={atCap}
          tagPh={t("tag_add_ph")}
          addLabel={t("add")}
          removeAria={t("remove_tag")}
        />
        <EditableTagSection
          title={t("profession_sec")}
          empty={t("none_yet")}
          items={professions}
          onAdd={(raw) => tryAdd("professions", raw)}
          onRemove={(tag) => removeFrom("professions", tag)}
          atCap={atCap}
          tagPh={t("tag_add_ph")}
          addLabel={t("add")}
          removeAria={t("remove_tag")}
        />
        <p className="text-xs leading-relaxed text-ink-600">{t("tags_split_note")}</p>
        <p className="text-[11px] font-medium text-ink-500">
          {t("tags_max")} · {allTags.length}/{MAX_TAGS_TOTAL}
        </p>
        <button
          type="button"
          onClick={saveTags}
          className="w-full rounded-2xl bg-ink-900 py-3 text-sm font-semibold text-white"
        >
          {t("profile_save_tags")}
        </button>
        {savedTags && (
          <p className="text-center text-xs font-medium text-sage-600">{t("profile_tags_saved")}</p>
        )}
        </div>

        <div className="token-panel section-fade mt-8 rounded-3xl bg-gradient-to-br from-violet-50 via-white to-sea-50 p-5 ring-1 ring-violet-200/60 tablet:mt-0 lg:sticky lg:top-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-700">{t("pro_badge")}</p>
        <h3 className="mt-2 font-display text-lg font-bold text-ink-950">{t("pro_title")}</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-700">{t("pro_body")}</p>
        <p className="mt-4 rounded-2xl bg-white/80 px-3 py-2 text-[11px] leading-relaxed text-ink-600 ring-1 ring-mist-200">
          {t("pro_note")}
        </p>
        </div>
      </div>
    </div>
  );
}

function EditableTagSection({
  title,
  empty,
  items,
  onAdd,
  onRemove,
  atCap,
  tagPh,
  addLabel,
  removeAria,
}: {
  title: string;
  empty: string;
  items: string[];
  onAdd: (raw: string) => void;
  onRemove: (tag: string) => void;
  atCap: boolean;
  tagPh: string;
  addLabel: string;
  removeAria: string;
}) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    onAdd(draft);
    setDraft("");
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-mist-200">
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      <div className="mt-2 flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-xl border border-mist-200 px-3 py-2 text-sm outline-none ring-sea-500/30 focus:ring-2"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
          placeholder={tagPh}
          disabled={atCap}
        />
        <button
          type="button"
          onClick={submit}
          disabled={atCap || !draft.trim()}
          className="shrink-0 rounded-xl bg-sea-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
        >
          {addLabel}
        </button>
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-ink-600">{empty}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((x) => (
            <span
              key={x}
              className="inline-flex items-center gap-1 rounded-full bg-mist-100 py-1 pl-3 pr-1 text-xs font-medium text-ink-800"
            >
              {x}
              <button
                type="button"
                aria-label={removeAria}
                onClick={() => onRemove(x)}
                className="rounded-full p-1 text-ink-500 hover:bg-white hover:text-ink-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
