import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractConsonants(text: string): string {
  const vowels = 'aeiouAEIOU';
  const consonants = [...text].filter(char =>
    /[0-9a-zA-Z]/.test(char) && !vowels.includes(char)
  );
  return consonants.join('');
}