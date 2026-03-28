import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { createT } from "@/i18n/translations";
import type { AppLocale } from "@/types";

export function useT() {
  const { currentUser } = useApp();
  const locale: AppLocale = currentUser?.appLanguage === "ne" ? "ne" : "en";
  return useMemo(() => ({ t: createT(locale), locale }), [locale]);
}
