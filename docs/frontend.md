# Frontend Guide - KontenKilat AI

## Ringkasan
Frontend ini adalah studio konten single-page berbasis Vite + React dengan orientasi mobile-first, dark premium UI, dan workflow kreatif lintas copy, visual, video, audio, campaign, canvas, copilot, serta settings provider.

## Struktur utama
- `src/App.tsx` - orchestration state dan shell utama
- `src/lib/studio.ts` - konstanta, data studio, helper, fallback, persistence helper, provider request
- `src/components/studio-ui.tsx` - primitive UI reusable
- `src/index.css` - token visual dasar, motion ringan, scrollbar, accessibility motion guard
- `public/brand/` - aset brand
- `public/generated/` - visual promosi / hero art
- `public/site.webmanifest` - PWA manifest dasar

## Provider yang didukung
- OpenRouter
- OpenAI
- Anthropic
- Google Gemini
- OpenAI-compatible endpoint
- Demo mode

## Env yang didukung
- `VITE_OPENROUTER_API_KEY`
- `VITE_OPENAI_API_KEY`
- `VITE_ANTHROPIC_API_KEY`
- `VITE_GEMINI_API_KEY`
- `VITE_COMPATIBLE_API_KEY`
- `VITE_COMPATIBLE_BASE_URL`

## Target viewport utama
### Mobile
- 360x800
- 375x812
- 390x844
- 393x852
- 412x915
- 430x932

### Tablet
- 768x1024
- 820x1180
- 1024x1366

### Desktop
- 1280
- 1440
- 1536
- 1920

## Checklist QA cepat
- Tidak ada horizontal overflow
- Bottom dock mobile tidak kepotong
- Header dan safe-area iOS aman
- Semua CTA bisa diklik dengan ibu jari
- Settings provider bisa simpan, export, import, dan test
- Demo mode tetap hidup tanpa API key
- Build produksi sukses
- Meta dan favicon muncul benar di deploy

## Alur penyimpanan lokal
Local storage menyimpan:
- active view
- provider settings
- chat history
- asset tersimpan
- draft masing-masing workspace
- output yang sudah dibuat

## Catatan desain
- Motion harus halus, ringan, dan bisa mati saat `prefers-reduced-motion`
- Bahasa UI diprioritaskan Indonesia yang ringkas dan jelas
- Komponen baru sebaiknya memakai primitive dari `src/components/studio-ui.tsx`

## Release frontend
1. `npm run build`
2. cek viewport mobile utama
3. push ke `main`
4. verifikasi GitHub Pages
