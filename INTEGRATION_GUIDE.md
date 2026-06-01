# 🚀 Panduan Integrasi Fitur Kolaborasi & Sharing

## ✅ Fitur yang Telah Ditambahkan

### 1. Share Jadwal (Read-Only Link)
- Generate token UUID dengan expiry 30 hari
- Route publik `/share/[token]` untuk viewing tanpa login
- Token bisa di-revoke dari halaman profile
- Security: hash token di DB, sanitasi output, noindex meta tag

### 2. Jadwal Kelas/Kelompok
- Field `kelasCode` di table users (indexed)
- Endpoint agregasi jadwal per kelas
- Halaman `/classes/[kode]` dengan filter & export CSV

---

## 📁 Struktur File Baru

```
/workspace
├── lib/
│   └── db-schema.ts              # Updated: +kelasCode, +shareTokens table
├── app/
│   ├── api/
│   │   ├── share/
│   │   │   ├── tokens/route.ts   # POST/GET/DELETE tokens
│   │   │   └── [token]/route.ts  # GET public schedule
│   │   ├── classes/
│   │   │   └── [kode]/schedules/route.ts  # GET class schedules
│   │   └── profile/
│   │       └── kelas/route.ts    # PATCH update kelasCode
│   ├── share/
│   │   └── [token]/
│   │       ├── page.tsx          # Public share page
│   │       └── shared-schedule-view.tsx
│   ├── classes/
│   │   └── [kode]/
│   │       ├── page.tsx          # Class view page
│   │       └── class-schedule-view.tsx
│   └── profile/
│       └── page.tsx              # Updated: +ShareManager, +KelasCode form
├── components/
│   └── share/
│       └── share-manager.tsx     # UI component for sharing
├── drizzle/
│   └── 0001_add_share_tokens_and_kelas_code.sql  # Migration file
└── __tests__/
    └── share-api.test.ts         # Unit test snippets
```

---

## 🔧 Langkah Integrasi

### Step 1: Jalankan Database Migration

```bash
# Pastikan koneksi database sudah dikonfigurasi di .env
# DATABASE_URL=postgresql://...

cd /workspace

# Option A: Push schema langsung (development)
npm run db:push

# Option B: Generate & apply migration (production)
npm run db:generate
npm run db:push
```

### Step 2: Verifikasi Schema

Cek apakah tabel baru dan kolom sudah ada:

```sql
-- Cek tabel share_tokens
SELECT * FROM share_tokens LIMIT 1;

-- Cek kolom kelas_code di users
SELECT nim, nama_lengkap, kelas_code FROM users LIMIT 5;
```

### Step 3: Update Profile User (Opsional)

Jika ada user existing yang ingin diberi kelasCode:

```sql
UPDATE users SET kelas_code = 'TI-2A' WHERE nim = '12345678';
```

### Step 4: Test API Endpoints

#### Share Tokens API
```bash
# 1. Generate token (butuh auth cookie)
curl -X POST http://localhost:3000/api/share/tokens \
  -H "Content-Type: application/json" \
  -H "Cookie: jadwalin_token=YOUR_JWT_TOKEN" \
  -d '{"expiresDays": 30}'

# 2. Get active tokens
curl http://localhost:3000/api/share/tokens \
  -H "Cookie: jadwalin_token=YOUR_JWT_TOKEN"

# 3. Revoke token
curl -X DELETE "http://localhost:3000/api/share/tokens?id=TOKEN_ID" \
  -H "Cookie: jadwalin_token=YOUR_JWT_TOKEN"
```

#### Public Share View
```bash
# Akses jadwal sharing (no auth required)
curl http://localhost:3000/api/share/YOUR_TOKEN_UUID
```

#### Class Schedules API
```bash
# Get aggregated schedules for a class
curl http://localhost:3000/api/classes/TI-2A/schedules \
  -H "Cookie: jadwalin_token=YOUR_JWT_TOKEN"
```

### Step 5: Test UI

1. **Login** ke aplikasi
2. Buka `/profile` → akan muncul section baru:
   - **Kode Kelas**: input field untuk join kelas
   - **Bagikan Jadwal**: generate & manage share links
3. Setelah set `kelasCode`, akses `/classes/TI-2A` (sesuai kode kelas)
4. Untuk share link: buka `/share/[token]` di browser incognito

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| Token Hashing | SHA-256 hash disimpan di DB, bukan plain text |
| Expiry Check | Token expire otomatis setelah 30 hari (configurable) |
| Revoke System | Flag `revoked` untuk disable manual |
| Access Control | Class schedules hanya bisa diakses member |
| Output Sanitization | Hanya field publik yang ditampilkan di share view |
| SEO Protection | `robots.noindex` di halaman sharing |

---

## 📝 Contoh Usage

### User Flow: Share Jadwal

1. User login → `/profile`
2. Scroll ke "Bagikan Jadwal"
3. Pilih durasi (7/14/30 hari) → klik "Buat Link Sharing"
4. Copy link yang muncul → kirim ke teman
5. Teman buka link → lihat jadwal (read-only)

### User Flow: Join Kelas

1. User login → `/profile`
2. Input kode kelas (misal: `TI-2A`) → Simpan
3. Klik "Lihat Jadwal Kelas" → redirect ke `/classes/TI-2A`
4. Lihat jadwal gabungan semua anggota kelas
5. Filter berdasarkan hari atau anggota

---

## ⚠️ Catatan Penting

1. **Environment Variable**: Tambahkan `NEXT_PUBLIC_APP_URL` di `.env`:
   ```env
   NEXT_PUBLIC_APP_URL=https://jadwalin-hazel.vercel.app
   ```

2. **Token Storage**: Token UUID hanya ditampilkan sekali saat generate. 
   User harus copy/link disimpan. Tidak bisa retrieve ulang.

3. **Multiple Tokens**: Saat ini sistem hanya izinkan 1 token aktif per user.
   Generate baru akan revoke token lama.

4. **Class Privacy**: User hanya bisa akses kelasnya sendiri. 
   Tidak ada directory/list kelas publik.

---

## 🧪 Testing

Jalankan test snippets (perlu setup Vitest):

```bash
# Install vitest jika belum
npm install -D vitest @types/node

# Run tests
npx vitest run __tests__/share-api.test.ts
```

---

## 🎯 Next Steps (Opsional)

- [ ] Invite system untuk join kelas via link
- [ ] Notification saat ada member baru join kelas
- [ ] Export to Google Calendar untuk class schedules
- [ ] Admin dashboard untuk manage semua kelas
- [ ] Rate limiting di API share endpoint

---

**Dibuat untuk JADWALIN v1.0** 🚀
