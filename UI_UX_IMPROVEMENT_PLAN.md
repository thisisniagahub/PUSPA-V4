# 🚀 PUSPA V4 — UI/UX Improvement Implementation Plan (2026 Vision)

Dokumen ini menggariskan langkah-langkah teknikal untuk mengimplementasikan peningkatan UI/UX pada PUSPA V4 berdasarkan inspirasi daripada *high-fidelity productivity dashboard*. Matlamat utama adalah untuk menukarkan PUSPA V4 daripada sistem pengurusan data kepada sebuah **Command Center** yang dinamik.

---

## 🎨 Fasa 1: Pemantapan Identiti Visual (Visual Hardening)

### 1.1 Penambahan Warna Aksen Sekunder
- **Warna Baru:** `Amber-500` (#F59E0B) atau `Orange-500`.
- **Kegunaan:** Digunakan untuk elemen "Critical", "Urgent", atau "In-Progress".
- **Action:** Kemaskini `tailwind.config.ts` untuk memasukkan palet warna oren yang harmoni dengan `Emerald-500`.

### 1.2 "Premium Glass" Effect pada Kad
- **CSS Enhancement:** Gunakan `backdrop-blur-xl`, `bg-zinc-950/40`, dan `border-white/10`.
- **Micro-shadows:** Tambah `drop-shadow-[0_0_15px_rgba(16,185,129,0.1)]` untuk memberikan efek "Holographic Glow".

---

## 🛠️ Fasa 2: Komponen & Widget Baru (Actionable UI)

### 2.1 `AsnafTaskCard` Component
- **Inspirasi:** Kad "Recent Tasks" daripada rujukan.
- **Ciri-ciri:**
  - Label status (e.g., "3 Hari Lagi", "Kritikal").
  - Deskripsi ringkas kes asnaf.
  - **Verification Progress Bar:** Menunjukkan tahap kemajuan verifikasi (Radix UI Progress).
  - **Officer Stacks:** Avatar pegawai yang menguruskan kes tersebut (Shadcn Avatar Group).

### 2.2 `CaseTimer` Widget
- **Fungsi:** Membolehkan pegawai NGO menjejak masa yang dihabiskan untuk sesuatu tugasan atau lawatan.
- **UI:** Paparan masa digital yang besar dengan kawalan *Start/Stop* yang minimalis.

---

## 🤖 Fasa 3: Maklum Balas AI & Komunikasi

### 3.1 `OpenClawLiveIndicator`
- **Visual:** Tambah animasi "Pulse" pada ikon AI apabila OpenClaw sedang memproses data di latar belakang.
- **Status:** Tunjukkan status ejen secara *real-time* (e.g., "Ejen Verifikasi sedang menyemak dokumen...").

### 3.2 `QuickMessages` Widget
- **Fungsi:** Senarai pertanyaan terbaru daripada asnaf atau penderma.
- **UI:** Kad mesej ringkas dengan penunjuk masa "Time-ago" (e.g., "2 minit lepas").

---

## 📈 Fasa 4: Visualisasi Data Lanjutan

### 4.1 Carta Interaktif (Recharts Enhancement)
- **Gradient Fills:** Gunakan *linear gradients* pada bar dan area charts (Emerald ke Transparent).
- **Tooltip Custom:** Tooltip yang mempunyai kesan *glassmorphism* dan maklumat yang lebih mendalam.

---

## 📋 Checklist Implementasi

- [ ] Kemaskini `tailwind.config.ts` dengan warna aksen baru.
- [ ] Refactor `src/components/dashboard/HolographicCard.tsx`.
- [ ] Cipta komponen `src/components/dashboard/AsnafTaskCard.tsx`.
- [ ] Integrasikan `CaseTimer` ke dalam modul *Ops Conductor*.
- [ ] Tambah widget `QuickMessages` pada Dashboard utama.
- [ ] Jalankan audit responsiviti pada peranti mudah alih.

---

**Disediakan Oleh:** Antigravity (Pakar UI/UX AI)
**Status:** Menunggu Kelulusan / Sedia untuk Pengekodan
