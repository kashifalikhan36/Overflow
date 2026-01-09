Expandable Tabs Component Integration
=====================================

Overview
--------
I integrated a new `ExpandableTabs` component at `components/ui/expandable-tabs.tsx` (and demo at `components/ui/expandable-tabs-demo.tsx`). This is designed for the shadcn project structure (components under `/components/ui`), TypeScript, and Tailwind CSS.

Why `/components/ui`?
---------------------
- `shadcn` organizes reusable primitives and UI components under `/components/ui` (icons, buttons, modals, etc.).
- Keeping components there keeps the UI layer consistent and easy to import across pages.

Files added
-----------
- `components/ui/expandable-tabs.tsx` — main component
- `components/ui/expandable-tabs-demo.tsx` — small demo (DefaultDemo & CustomColorDemo)
- `lib/useOnClickOutside.ts` — small local `useOnClickOutside` hook to avoid extra dependencies (lightweight fallback)

Dependencies
------------
- `framer-motion` — used for animations (already in the repo)
- `lucide-react` — icon set used in demos (already in the repo)
- `usehooks-ts` — original component references `useOnClickOutside` from this package. I implemented a small local hook so you don’t need to install it; install it if you prefer the library: `npm i usehooks-ts`.

If you don’t have shadcn/Tailwind/TypeScript set up
---------------------------------------------------
1. Install Tailwind (official docs):
   - `npm install -D tailwindcss postcss autoprefixer`
   - `npx tailwindcss init -p`
   - Add the Tailwind directives to `globals.css` and set `content` in `tailwind.config.js`.
2. Add TypeScript (if not present):
   - `npm install -D typescript @types/react @types/node`
   - Run `npx tsc --init` and configure `tsconfig.json` (Next.js adds one automatically on the first `.ts` file).
3. shadcn (optional):
   - `npx shadcn-ui@latest init` — follow prompts (component folder default is `/components/ui`).

How to use the component
------------------------
Import and pass an array of tabs (title/icon). Use `type: 'separator' as const` for separators.

Example:

```tsx
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { Home, Bell, Archive } from 'lucide-react';

const tabs = [
  { title: 'All Notes', icon: Home },
  { title: 'Reminders', icon: Bell },
  { type: 'separator' as const },
  { title: 'Archive', icon: Archive },
];

<ExpandableTabs tabs={tabs} activeColor="text-primary" onChange={(index) => console.log(index)} />
```

Integration notes
-----------------
- I replaced the Sidebar navigation with `ExpandableTabs` (compact, animated, polished). The replacement is in `components/layout/sidebar.tsx`.
- The component uses only icons (lucide) and no decorative images.
- If you prefer the `usehooks-ts` implementation of `useOnClickOutside`, remove `lib/useOnClickOutside.ts` and run `npm i usehooks-ts`.

TypeScript quirks
-----------------
- When using separators, type them as `type: 'separator' as const` so the literal type matches the component definition.
- The `framer-motion` transition `type` needs to be a literal (e.g. `'spring' as const`) for TypeScript to accept it.

Questions to consider
---------------------
- Where do you want this navigation used (header, sidebar, top toolbar)? I replaced the Sidebar by default.
- Any desired active color or motion tweaks? The component accepts `activeColor` for text color when active.

If you want I can:
- Add storybook stories or a dedicated demo route (e.g., `/components/expandable-tabs`) to preview the component in the browser.
- Add a visual test (Chromatic or Playwright snapshot) for the component.

---
If you'd like, I can now polish the visuals and animations further (tweak spacing, color usage, hover states) to fully match the professional + fun look you requested.
