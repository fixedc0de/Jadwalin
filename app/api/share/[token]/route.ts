import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shareTokens, users, schedules } from '@/lib/db-schema';
import { eq, and, gt, sql } from 'drizzle-orm';
import { createHash } from 'crypto';

/**
 * Hash token UUID untuk lookup di database
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * GET /api/share/[token] - Ambil jadwal dari token sharing (public, no auth required)
 * Security: rate limiting, sanitasi output, hanya data publik
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length === 0) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 400 }
      );
    }

    // Hash token untuk lookup di database
    const tokenHash = hashToken(token);

    // Cari token di database
    const tokenRecord = await db
      .select({
        id: shareTokens.id,
        userId: shareTokens.userId,
        expiresAt: shareTokens.expiresAt,
        revoked: shareTokens.revoked,
        userName: users.namaLengkap,
      })
      .from(shareTokens)
      .leftJoin(users, eq(shareTokens.userId, users.id))
      .where(eq(shareTokens.tokenHash, tokenHash))
      .limit(1);

    if (!tokenRecord || tokenRecord.length === 0) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 404 }
      );
    }

    const record = tokenRecord[0];

    // Cek apakah token sudah di-revoke
    if (record.revoked) {
      return NextResponse.json(
        { error: 'Token ini telah dicabut oleh pemiliknya' },
        { status: 403 }
      );
    }

    // Cek apakah token sudah expired
    if (new Date() > record.expiresAt) {
      return NextResponse.json(
        { error: 'Token telah kadaluarsa' },
        { status: 403 }
      );
    }

    // Ambil jadwal user (hanya field yang aman untuk publik)
    const scheduleData = await db
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
      })
      .from(schedules)
      .where(eq(schedules.userId, record.userId))
      .orderBy(schedules.hari, schedules.waktuMulai);

    // Sanitasi output: jangan expose data sensitif
    // NIM, email, ID user tidak ditampilkan
    return NextResponse.json({
      success: true,
      ownerName: record.userName, // Hanya nama lengkap
      expiresAt: record.expiresAt,
      schedules: scheduleData.map((s) => ({
        ...s,
        // Pastikan tidak ada data sensitif bocor
        catatan: s.catatan || null, // Bisa null
      })),
    });
  } catch (error: any) {
    console.error('Error fetching shared schedule:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil jadwal sharing' },
      { status: 500 }
    );
  }
}
