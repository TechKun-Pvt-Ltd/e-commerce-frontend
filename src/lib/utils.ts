import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debounce<F extends (...args: any) => any>(func: F, timeout = 300){
  let timer: NodeJS.Timeout;
  return (...args: Parameters<F>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), timeout);
  };
};

export function extractConsonants(text: string): string {
  const vowels = 'aeiouAEIOU';
  const consonants = [...text].filter(char =>
    /[0-9a-zA-Z]/.test(char) && !vowels.includes(char)
  );
  return consonants.join('');
}