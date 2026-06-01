import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, schedules } from '@/lib/db-schema';
import { getSession } from '@/lib/auth';
import { eq, and, sql } from 'drizzle-orm';

/**
 * GET /api/classes/[kode]/schedules - Agregasi jadwal semua user di kelas yang sama
 * Protected: hanya user dengan kelasCode yang sama bisa akses
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ kode: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { kode } = await params;

    if (!kode || kode.trim().length === 0) {
      return NextResponse.json(
        { error: 'Kode kelas tidak valid' },
        { status: 400 }
      );
    }

    const normalizedKode = decodeURIComponent(kode).trim();

    // Cek apakah user ini punya kelasCode
    const currentUser = await db
      .select({ kelasCode: users.kelasCode })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!currentUser || !currentUser[0]?.kelasCode) {
      return NextResponse.json(
        { error: 'Anda belum bergabung dengan kelas manapun' },
        { status: 403 }
      );
    }

    // Security: pastikan user hanya bisa akses kelasnya sendiri
    if (currentUser[0].kelasCode !== normalizedKode) {
      return NextResponse.json(
        { error: 'Akses ditolak: Anda bukan anggota kelas ini' },
        { status: 403 }
      );
    }

    // Ambil semua user di kelas ini
    const classUsers = await db
      .select({
        id: users.id,
        namaLengkap: users.namaLengkap,
      })
      .from(users)
      .where(eq(users.kelasCode, normalizedKode));

    if (!classUsers || classUsers.length === 0) {
      return NextResponse.json({
        success: true,
        className: normalizedKode,
        members: [],
        schedules: [],
      });
    }

    const userIds = classUsers.map((u) => u.id);

    // Agregasi jadwal semua member kelas
    const allSchedules = await db
      .select({
        id: schedules.id,
        mataPelajaran: schedules.mataPelajaran,
        namaDosen: schedules.namaDosen,
        ruangan: schedules.ruangan,
        waktuMulai: schedules.waktuMulai,
        waktuSelesai: schedules.waktuSelesai,
        hari: schedules.hari,
        sks: schedules.sks,
        warnaKategori: schedules.warnaKategori,
        catatan: schedules.catatan,
        ownerName: users.namaLengkap, // Tampilkan pemilik jadwal
        ownerId: users.id,
      })
      .from(schedules)
      .leftJoin(users, eq(schedules.userId, users.id))
      .where(eq(users.kelasCode, normalizedKode))
      .orderBy(schedules.hari, schedules.waktuMulai);

    // Format response
    return NextResponse.json({
      success: true,
      className: normalizedKode,
      memberCount: classUsers.length,
      members: classUsers.map((m) => ({
        id: m.id,
        namaLengkap: m.namaLengkap,
      })),
      schedules: allSchedules,
    });
  } catch (error: any) {
    console.error('Error fetching class schedules:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil jadwal kelas' },
      { status: 500 }
    );
  }
}
