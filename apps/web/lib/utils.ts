type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, boolean>
  | ClassValue[];

import { twMerge } from "tailwind-merge";

function toClassString(input: ClassValue): string {
  if (!input) return "";
  if (typeof input === "string" || typeof input === "number") return String(input);
  if (Array.isArray(input)) return input.map(toClassString).filter(Boolean).join(" ");
  if (typeof input === "object") {
    return Object.entries(input)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([name]) => name)
      .join(" ");
  }
  return "";
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(inputs.map(toClassString).filter(Boolean).join(" "));
}

export function maskSensitiveNumber(value: string | null | undefined): string {
  if (!value) return '-';
  const str = String(value).trim();
  if (str.length < 7) return str;
  return `${str.slice(0, 4)}*********${str.slice(-3)}`;
}
