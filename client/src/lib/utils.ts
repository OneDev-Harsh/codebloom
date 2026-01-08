import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { diffWords } from "diff"

export const diffText = (oldText = "", newText = "") => {
  return diffWords(oldText, newText)
}

export const diffStyles = (
  oldStyles: Record<string, string>,
  newStyles: Record<string, string>
) => {
  return Object.entries(newStyles).filter(
    ([key, value]) => oldStyles[key] !== value
  )
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
