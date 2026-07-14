/**
 * Minimal classname joiner for the one dropped-in component
 * (components/ui/animated-gradient.tsx) that expects a shadcn-style `cn`.
 * This project has no Tailwind/tailwind-merge (see AGENTS.md/build brief),
 * so this is plain concatenation rather than the usual clsx+twMerge pair —
 * sufficient here since nothing calls it with conflicting utility classes.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
