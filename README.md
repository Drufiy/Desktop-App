# Desktop App Monorepo

This repository combines the user-facing desktop application built with Next.js and the native shell powered by Tauri. The sections below summarise the key paths and explain what lives in each area of the codebase.

## Repository layout

| Path | Purpose |
| ---- | ------- |
| `app/` | Application routes, layouts, and pages for the Next.js front-end. |
| `components/` | Reusable UI components shared across the application. |
| `hooks/` | Custom React hooks encapsulating shared stateful logic. |
| `lib/` | Helper utilities and configuration modules used by the app layer. |
| `public/` | Static assets such as images, icons, and other files served directly by Next.js. |
| `styles/` | Global stylesheets and Tailwind helpers consumed throughout the UI. |
| `src-tauri/` | Rust source code, configuration, and build scripts for the Tauri desktop wrapper. |
| `next.config.mjs` | Next.js framework configuration for the web layer of the desktop app. |
| `tailwind.config.ts` | Tailwind CSS theme configuration. |
| `package.json` | JavaScript dependencies, scripts, and metadata for the workspace. |

## Getting started

Install dependencies and run the development server:

```bash
pnpm install
pnpm dev
```

For the desktop build, use the Tauri CLI:

```bash
pnpm tauri dev
```

## Additional resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tauri Documentation](https://tauri.app/v2/guides/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

