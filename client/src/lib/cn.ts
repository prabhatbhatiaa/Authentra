import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge about the custom display font sizes from tailwind.config.js;
// otherwise `text-display-sm` is mistaken for a colour and dropped next to `text-ok`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display-2xl', 'display-xl', 'display-lg', 'display-md', 'display-sm'] }],
    },
  },
});

/** Merge conditional class names and resolve conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
