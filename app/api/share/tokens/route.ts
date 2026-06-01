import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shareTokens, users, schedules } from '@/lib/db-schema';
import { getSession } from '@/lib/auth';
import { eq, and, gt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';

// Schema untuk validasi request generate token
const generateTokenSchema = z.object({
  expiresDays: z.number().int().min(1).max(30).optional().default(30),
});

/**
 * Hash token UUID untuk disimpan di database
 * Security best practice: jangan simpan token plain text
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * GET /api/share/tokens - Ambil semua token aktif user
 */
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Ambil semua token yang belum expired dan belum di-revoke
    const tokens = await db
      .select({
        id: shareTokens.id,
        expiresAt: shareTokens.expiresAt,
        revoked: shareTokens.revoked,
        createdAt: shareTokens.createdAt,
      })
      .from(shareTokens)
      .where(
        and(
          eq(shareTokens.userId, user.id),
          gt(shareTokens.expiresAt, new Date()),
          eq(shareTokens.revoked, false)
        )
      )
      .orderBy(shareTokens.createdAt);

    return NextResponse.json(tokens);
  } catch (error: any) {
    console.error('Error fetching share tokens:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data share token' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/share/tokens - Generate token sharing baru
 */
export async function POST(req: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const valid = generateTokenSchema.parse(body);

    // Revoke semua token lama user ini (opsional, hanya 1 token aktif per user)
    // Jika ingin multiple tokens, hapus bagian ini
    await db
      .update(shareTokens)
      .set({ revoked: true })
      .where(eq(shareTokens.userId, user.id));

    // Generate UUID token baru
    const token = randomUUID();
    const tokenHash = hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + valid.expiresDays);

    // Simpan token ke database
    await db.insert(shareTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
      revoked: false,
    });

    // Return token plain text (hanya sekali, tidak bisa diambil lagi)
    return NextResponse.json({
      success: true,
      token,
      expiresAt: expiresAt.toISOString(),
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://jadwalin-hazel.vercel.app'}/share/${token}`,
    });
  } catch (error: any) {
    console.error('Error generating share token:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Gagal membuat share token' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/share/tokens - Revoke token sharing
 */
export async function DELETE(req: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get('id');

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID diperlukan' },
        { status: 400 }
      );
    }

    // Revoke token (hanya jika milik user ini)
    await db
      .update(shareTokens)
      .set({ revoked: true })
      .where(
        and(
          eq(shareTokens.id, tokenId as any),
          eq(shareTokens.userId, user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error revoking share token:', error);
    return NextResponse.json(
      { error: 'Gagal revoke share token' },
      { status: 500 }
    );
  }
}
