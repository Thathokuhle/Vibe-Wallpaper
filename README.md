# VibeWallpaper AI

Generate cinematic, high-detail wallpapers from short prompts. VibeWallpaper AI is a React + Vite app powered by Google Gemini Imagen 4, with a Three.js background scene and a streamlined prompt-to-download workflow.

## Features

- Text-to-wallpaper generation (4 images per prompt) with selectable aspect ratios.
- Full-screen viewer with download and "Remix" to re-run a prompt.
- Prompt history saved locally with quick reuse and reset controls.
- Animated Three.js background and responsive layout.

## Tech stack

- React 19, TypeScript, Vite
- Google GenAI SDK (@google/genai) with Imagen 4
- Three.js for realtime background visuals

## Getting started

### Prerequisites

- Node.js 18+ (or compatible with Vite 6)
- A Gemini API key with access to Imagen models

### Configure environment

Create `.env.local` in the project root:

```bash
GEMINI_API_KEY=your_api_key_here
```

If you want auth + cloud prompt history, also set:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor to create the `prompt_history` table and policies.

### Install and run

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000.

## Scripts

- `npm run dev` Start the dev server
- `npm run build` Production build
- `npm run preview` Preview the production build locally

## Usage

1. Enter a prompt describing the vibe, scene, or style.
2. Select an aspect ratio.
3. Generate and pick one of the four results.
4. Download or remix to regenerate variations.

## Project structure

- `App.tsx` App shell, state, prompt history handling
- `components/` UI building blocks and Three.js background
- `services/geminiService.ts` Image generation via Gemini SDK
- `types.ts` Shared types and aspect ratio options

## Notes

- The API key is injected into the client build via Vite defines. For production, route requests through a server to keep keys private.
- Prompt history is stored in the browser and can be cleared from the sidebar.
- When signed in, prompt history is stored in Supabase and synced automatically.
