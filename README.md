# 🎓 JADWALIN - Aplikasi Penjadwalan Akademik

Aplikasi web untuk mengelola jadwal kuliah mahasiswa dengan fitur lengkap, aman, dan modern.

## ✨ Fitur

- 🔐 **Autentikasi JWT** dengan enkripsi bcrypt
- 📅 **CRUD Jadwal** dengan validasi konflik otomatis
- 🎨 **Dark/Light Mode** dengan persistensi preferensi
- 📤 **Export Fleksibel**: PDF untuk print, iCal untuk Google Calendar/Outlook
- 🗄️ **Database PostgreSQL** di Vercel dengan Drizzle ORM
- 📱 **Responsive Design** untuk mobile, tablet, dan desktop
- ⚡ **Fast & Optimized** dengan Next.js App Router + Turbopack

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau pnpm
- Akun Vercel (untuk deployment)

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/username/jadwalin.git
cd jadwalin

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan credentials database Anda

# 4. Generate & push database schema
npm run db:generate
npm run db:push

# 5. Start development server
npm run dev