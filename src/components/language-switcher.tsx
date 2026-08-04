"use client";
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { getStoredLang, setStoredLang } from "@/lib/i18n";

const LANGS = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export function LanguageSwitcher() {
  const [lang, setLang] = useState("pt");
  useEffect(() => {
    setLang(getStoredLang());
  }, []);
  return (
    <div className="flex items-center gap-1 bg-white border border-[#e8e2d4] rounded-full p-1">
      <Globe size={14} className="ml-2 text-[#8a826a]" />
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => {
            setLang(l.code);
            setStoredLang(l.code);
            window.location.reload();
          }}
          className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
            lang === l.code ? "bg-[#0f0f11] text-[#c5a84a]" : "text-[#8a826a] hover:text-[#0f0f11]"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
