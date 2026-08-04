"use client";
import { useEffect, useState } from "react";

const cache: Record<string, Record<string, string>> = {};

export function useTranslations(lang: string = "pt") {
  const [dict, setDict] = useState<Record<string, string>>({});
  useEffect(() => {
    if (cache[lang]) {
      setDict(cache[lang]);
      return;
    }
    fetch(`/api/i18n/${lang}`)
      .then((r) => r.json())
      .then((d) => {
        cache[lang] = d.translations;
        setDict(d.translations);
      })
      .catch(() => setDict({}));
  }, [lang]);
  return (key: string) => dict[key] ?? key;
}

export function getStoredLang(): string {
  if (typeof window === "undefined") return "pt";
  return localStorage.getItem("mori_lang") ?? "pt";
}

export function setStoredLang(lang: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("mori_lang", lang);
  }
}
