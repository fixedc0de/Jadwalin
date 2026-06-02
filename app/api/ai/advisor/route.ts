import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import { schedules } from "@/lib/db-schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// Inisialisasi Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    // 1. Verifikasi user yang login
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    // 2. Ambil data jadwal dari database milik user yang login
    const scheduleData = await db
      .select()
      .from(schedules)
      .where(eq(schedules.userId, user.id));

    if (!scheduleData || scheduleData.length === 0) {
      return NextResponse.json(
        { 
          error: "Jadwal tidak ditemukan.",
          advice: "Sepertinya kamu belum memiliki jadwal. Ayo tambahkan jadwal kuliahmu terlebih dahulu untuk mendapatkan saran manajemen waktu yang personal!"
        },
        { status: 404 }
      );
    }

    // 3. Definisikan system prompt untuk AI
    const systemPrompt = `
Kamu adalah Asisten Produktivitas Mahasiswa yang ramah, penuh semangat, dan peduli. Tugas kamu adalah menganalisis jadwal kuliah mahasiswa dan memberikan saran manajemen waktu yang personal, praktis, dan membangun semangat.

Format Input:
- Data jadwal dalam bentuk JSON array dari database PostgreSQL.
- Setiap entri memiliki properti: 'mataPelajaran', 'namaDosen', 'ruangan', 'waktuMulai', 'waktuSelesai', 'hari', 'sks', 'warnaKategori', 'catatan'.
- Waktu dalam format HH:MM (24 jam).
- Hari dalam bahasa Indonesia: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu.

Tugas Analisis:
1. **Identifikasi Kepadatan Jadwal**: 
   - Hitung total jam kuliah per minggu.
   - Identifikasi hari yang paling padat.
   - Deteksi jika ada hari dengan lebih dari 6 jam kuliah berturut-turut tanpa istirahat cukup.

2. **Identifikasi Celah Waktu (Free Time)**:
   - Cari jarak antar kelas yang lebih dari 1 jam.
   - Identifikasi hari yang memiliki waktu luang signifikan.

3. **Berikan Saran Praktis**:
   - Jika jadwal terlalu padat: Sarankan teknik istirahat (Pomodoro 25/5), waktu tidur cukup, manajemen stres, dan prioritas tugas.
   - Jika ada celah waktu: Sarankan aktivitas produktif seperti review materi, mengerjakan tugas, olahraga ringan, atau networking.
   - Berikan tips spesifik berdasarkan pola jadwal (misal: "Selasa sangat padat, siapkan malam sebelumnya").

Format Output:
- Jawaban dalam bahasa Indonesia yang santai dan bersahabat.
- Format jawaban WAJIB dalam Markdown dengan struktur berikut:
  - Gunakan # untuk judul utama
  - Gunakan ## untuk sub-judul (Analisis Jadwal, Saran Manajemen Waktu, Motivasi)
  - Gunakan bullet points (-) untuk daftar saran
  - Gunakan **bold** untuk penekanan penting
  - Gunakan emoji secukupnya untuk membuat suasana lebih ceria (📚, ⏰, ☕, 💪, 🎯, ✨)
- Struktur jawaban:
  1. **Sapaan Personal** dengan nama user (jika tersedia) atau sapaan umum
  2. **📊 Analisis Jadwal** - Ringkasan jadwal mingguan
  3. **💡 Saran Manajemen Waktu** - 3-5 saran praktis dan spesifik
  4. **⚠️ Peringatan** (jika ada jadwal terlalu padat atau potensi burnout)
  5. **🌟 Kata Motivasi** - Kalimat penutup yang menyemangati

Gaya Bahasa:
- Ramah, mendukung, dan tidak menghakimi
- Gunakan kata "kamu" untuk pendekatan personal
- Hindari jargon teknis yang berlebihan
- Fokus pada keseimbangan antara produktivitas dan kesejahteraan mental
`;

    // 4. Siapkan konteks untuk AI dengan data jadwal
    const contextPrompt = `
Berikut adalah data jadwal kuliah saya:
${JSON.stringify(scheduleData, null, 2)}

Mohon analisis jadwal saya dan berikan saran manajemen waktu yang personal, praktis, dan membangun semangat sesuai dengan instruksi di atas.
`;

    // 5. Validasi API Key
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error("GOOGLE_GEMINI_API_KEY tidak ditemukan di environment variables");
      return NextResponse.json(
        { 
          error: "Konfigurasi AI belum lengkap.",
          advice: "Maaf, fitur AI Advisor sedang tidak tersedia karena konfigurasi API key belum lengkap. Silakan hubungi administrator."
        },
        { status: 503 }
      );
    }

    // 6. Konfigurasi model dan generasi konten
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt 
    });

    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    const aiAdvice = response.text();

    if (!aiAdvice || aiAdvice.trim() === "") {
      throw new Error("AI tidak menghasilkan saran.");
    }

    return NextResponse.json({ 
      success: true,
      advice: aiAdvice,
      scheduleCount: scheduleData.length 
    });

  } catch (error) {
    console.error("Error di API AI Advisor:", error);
    
    let errorMessage = "Gagal mendapatkan saran dari AI.";
    let detailedMessage = "";
    
    if (error instanceof Error) {
      detailedMessage = error.message;
      if (error.message.includes("API key")) {
        errorMessage = "API Key Google Gemini tidak valid atau kadaluarsa.";
      } else if (error.message.includes("quota")) {
        errorMessage = "Kuota API Google Gemini telah habis.";
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Gagal terhubung ke layanan AI. Periksa koneksi internet Anda.";
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: detailedMessage,
        advice: "Maaf, terjadi kesalahan saat menganalisis jadwalmu. Silakan coba lagi nanti atau pastikan koneksi internetmu stabil."
      },
      { status: 500 }
    );
  }
}
