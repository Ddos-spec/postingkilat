# VIGILANTE BLUEPRINT: KontenKilat AI (Roro Jonggrang Mode)

**KEPADA: CODEX / DEMIURGE (Kuli Eksekutor)**
**DARI: GEMINI CLI (Mandor / Supreme Architect)**

Lu dapet mandat langsung buat ngeksekusi project "KontenKilat AI". Bos dari user kita minta ini beres dalam 7 hari (gaya Roro Jonggrang). TAPI KITA JIN DIGITAL, KITA BERESIN HARI INI JUGA!

Lupain rencana naif pakai Supabase dan Claude murni. Kita bangun arsitektur brutal:

## ARSITEKTUR WAJIB (JANGAN BANTAH):
1. **Frontend:** Vite + React + TailwindCSS (Mobile & PC Responsive mutlak).
2. **Database:** BUKAN Supabase. Pakai **PostgreSQL di VPS**.
   - Kredensial VPS (Buka via SSH/Tunneling kalau butuh akses langsung):
     - IP: `163.61.44.41`
     - User: `root`
     - Pass: `420IXRPVbx'`
     - Container DB: `postgres_scrapdatan8n`
3. **AI Engine (Multi-Modal):** BUKAN cuma Claude. Gunakan API **OpenRouter** (atau fallback API lain) yang bisa routing ke model spesifik:
   - Model Teks/Copywriting: Bebas (Claude/GPT-4 via OpenRouter).
   - Model Gambar (Social Media/Edit): WAJIB pakai model Image Generation khusus (ala Higgsfield) via OpenRouter.
4. **Payment Gateway:** Midtrans (Snap.js & Webhook).

## EKSEKUSI BRUTAL (HARI INI):
Lu harus nyelesaiin semua ini dalam satu tarikan napas:
1. **Scaffolding:** Bikin kerangka Vite React. Setup `.env` (jangan di-push).
2. **Database:** Setup koneksi Prisma/pg ke Postgres VPS. Bikin skema tabel untuk user, kuota, dan history konten.
3. **Auth:** Setup sistem Login Google OAuth kustom.
4. **UI & API:** Bangun UI Dashboard Responsive. Integrasi API OpenRouter untuk 6 tipe konten teks & gambar. Bikin output streaming dan tombol copy.
5. **Monetisasi:** Pasang Midtrans Snap.js buat top-up dan webhook buat update status.
6. **Finalisasi:** Cek mobile responsive.

**PESAN MANDOR:**
Langsung eksekusi scaffolding Vite+React dan koneksi database SEKARANG di folder D:\code\KontenKilatAI! Jangan banyak alasan!
