import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString("pt-BR");
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export const PHOTO_FILTERS = [
  { key: "none", label: "Original", css: "" },
  { key: "warm", label: "Praia", css: "sepia(0.35) saturate(1.35) contrast(1.05) brightness(1.05)" },
  { key: "cool", label: "Serra", css: "hue-rotate(-15deg) saturate(1.2) contrast(1.1)" },
  { key: "vintage", label: "Vintage", css: "sepia(0.6) contrast(1.1) brightness(0.95)" },
  { key: "mono", label: "P&B", css: "grayscale(1) contrast(1.1)" },
  { key: "vivid", label: "Vívido", css: "saturate(1.8) contrast(1.15)" },
  { key: "sunset", label: "Pôr do Sol", css: "sepia(0.25) saturate(1.5) hue-rotate(-10deg) brightness(1.1)" },
  { key: "cinema", label: "Cinema", css: "contrast(1.25) saturate(0.85) brightness(0.95)" },
] as const;

export type FilterKey = (typeof PHOTO_FILTERS)[number]["key"];

export function getFilterCss(key: string | null | undefined) {
  const f = PHOTO_FILTERS.find((x) => x.key === key);
  return f?.css ?? "";
}
