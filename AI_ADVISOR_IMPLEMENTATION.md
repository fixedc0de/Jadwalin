# 🤖 AI Time Management Advisor - Panduan Implementasi

## Fitur Baru: AI Time Management Advisor

Fitur ini menggunakan Google Gemini AI untuk menganalisis jadwal kuliah user dan memberikan saran manajemen waktu yang personal.

---

## 📋 Struktur File yang Dibuat

```
/workspace
├── app/
│   └── api/
│       └── ai/
│           └── advisor/
│               └── route.ts          # API Endpoint untuk AI Advisor
├── components/
│   └── AiAdvisorCard.tsx             # Komponen React untuk UI AI Advisor
└── tailwind.config.ts                # Sudah ditambahkan plugin @tailwindcss/typography
```

---

## 🔧 Konfigurasi Environment Variables

Tambahkan variabel berikut ke file `.env.local`:

```bash
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

### Cara Mendapatkan API Key:
1. Kunjungi [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Login dengan akun Google Anda
3. Klik "Create API Key"
4. Salin API key dan tempel ke `.env.local`

---

## 🚀 Cara Menggunakan

### 1. Di Dashboard Page (Sudah Terintegrasi)

Komponen `AiAdvisorCard` sudah ditambahkan ke halaman dashboard (`app/dashboard/page.tsx`). User dapat langsung mengakses fitur ini setelah login.

### 2. Menggunakan Komponen di Halaman Lain

Jika ingin menambahkan komponen ini di halaman lain:

```tsx
import AiAdvisorCard from '@/components/AiAdvisorCard';

// Di dalam component Anda
<AiAdvisorCard scheduleEvents={scheduleData} />
```

---

## 📡 API Endpoint: `/api/ai/advisor`

### Method: POST

### Request:
Tidak perlu mengirim body secara manual - endpoint ini akan otomatis mengambil data jadwal dari database berdasarkan session user yang login.

### Response Success (200):
```json
{
  "success": true,
  "advice": "# Analisis Jadwal Kamu...\n\n## Saran Manajemen Waktu\n- ...",
  "scheduleCount": 5
}
```

### Response Error:
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "advice": "Fallback advice message"
}
```

---

## 🎨 Fitur UI/UX

### Komponen `AiAdvisorCard`:

1. **Tombol Generate** dengan state loading yang jelas
   - Efek shimmer/skeleton saat loading
   - Text "AI sedang menganalisis jadwalmu..."
   - Icon spinner animasi

2. **Render Markdown** yang rapi
   - Menggunakan `react-markdown` dengan plugin `remark-gfm`
   - Styling Tailwind CSS dengan class `prose`
   - Support dark mode dengan `dark:prose-invert`

3. **Error Handling** yang user-friendly
   - Pesan error yang jelas
   - Fallback advice jika tersedia

4. **Info Badge** menampilkan jumlah jadwal

---

## 🧠 System Prompt AI

AI diprogram untuk berperan sebagai **"Asisten Produktivitas Mahasiswa"** dengan karakteristik:

- **Ramah dan Mendukung**: Menggunakan bahasa santai dan memotivasi
- **Analitis**: Menganalisis kepadatan jadwal dan celah waktu
- **Praktis**: Memberikan saran yang bisa langsung diterapkan
- **Personal**: Menyapa user dan menyesuaikan saran dengan kondisi jadwal

### Format Output AI:
- Markdown dengan heading (#, ##)
- Bullet points untuk daftar saran
- Emoji untuk visual yang lebih menarik
- Struktur: Sapaan → Analisis → Saran → Peringatan (jika ada) → Motivasi

---

## 🔒 Keamanan

- Endpoint dilindungi dengan autentikasi session
- Hanya user yang login yang bisa mengakses
- Data jadwal diambil langsung dari database milik user tersebut
- API key divalidasi sebelum memanggil Google Gemini

---

## 🛠️ Troubleshooting

### Error: "GOOGLE_GEMINI_API_KEY tidak ditemukan"
**Solusi**: Pastikan variabel environment sudah diset di `.env.local`

### Error: "Unauthorized"
**Solusi**: Pastikan user sudah login dan memiliki session valid

### Error: "Jadwal tidak ditemukan"
**Solusi**: User perlu menambahkan jadwal terlebih dahulu di menu Schedule

### Error: "Kuota API habis"
**Solusi**: Periksa kuota API key di Google AI Studio atau gunakan key lain

---

## 📦 Dependencies

Package yang digunakan (sudah terinstall di project):

```json
{
  "@google/generative-ai": "^0.21.0",
  "react-markdown": "^9.0.1",
  "remark-gfm": "^4.0.0",
  "@tailwindcss/typography": "^0.5.x"
}
```

---

## 💡 Tips Pengembangan Lebih Lanjut

1. **Custom Analysis**: Tambahkan logika analisis custom sebelum mengirim ke AI
2. **History**: Simpan history saran AI ke database untuk referensi user
3. **Export**: Tambahkan fitur export saran ke PDF atau email
4. **Schedule Integration**: Tambahkan tombol untuk langsung membuat jadwal baru berdasarkan saran AI
5. **Multi-language**: Support bahasa lain selain Indonesia

---

## 📝 Contoh Output AI

```markdown
# Halo! Ini Analisis Jadwal Kamu 📚

## 📊 Analisis Jadwal
Kamu memiliki **5 jadwal kuliah** minggu ini dengan total sekitar **15 jam** kuliah. Hari tersibukmu adalah **Selasa** dengan 3 mata kuliah berturut-turut!

## 💡 Saran Manajemen Waktu

1. **Selasa Sangat Padat** ⚠️
   - Pastikan tidur cukup malam Senin (minimal 7 jam)
   - Siapkan bekal makan siang malam sebelumnya
   - Gunakan teknik Pomodoro (25 menit fokus, 5 menit istirahat)

2. **Manfaatkan Celah Waktu** ⏰
   - Kamis pagi ada jarak 2 jam antar kelas
   - Gunakan untuk review materi atau mengerjakan tugas di perpustakaan

3. **Jumat Lebih Ringan** ✨
   - Cocok untuk olahraga sore atau networking dengan teman
   - Jangan lupa siapkan materi untuk minggu depan

## 🌟 Kata Motivasi
"Hebat! Kamu sudah mengatur jadwal dengan baik. Tetap konsisten dan jangan lupa istirahat. Balance is key! 💪"
```

---

**Dibuat untuk Project JADWALIN** 🎯
