import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collaborations, users as usersTable } from '@/lib/db-schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

// Moved to the top for better code organization
const usersTableForCollab = usersTable;

// DELETE /api/collaborations/[collaborationId] - Remove collaborator
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ collaborationId: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { collaborationId } = await params;

  try {
    const [collab] = await db.select()
      .from(collaborations)
      .where(eq(collaborations.id, collaborationId));

    if (!collab) {
      return NextResponse.json({ error: 'Kolaborasi tidak ditemukan' }, { status: 404 });
    }

    // Only owner can remove collaborator, or collaborator can leave
    if (collab.ownerUserId !== user.id && collab.collaboratorUserId !== user.id) {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus kolaborasi ini' }, { status: 403 });
    }

    await db.delete(collaborations)
      .where(eq(collaborations.id, collaborationId));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Remove collaboration error:', err);
    return NextResponse.json({ error: err.message || 'Gagal menghapus kolaborasi' }, { status: 500 });
  }
}

// GET /api/collaborations/[collaborationId] - Get collaboration details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ collaborationId: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { collaborationId } = await params;

  try {
    // Get the collaboration with user info
    const [collab] = await db.select({
      id: collaborations.id,
      permissionLevel: collaborations.permissionLevel,
      status: collaborations.status,
      invitedAt: collaborations.invitedAt,
      respondedAt: collaborations.respondedAt,
      createdAt: collaborations.createdAt,
      owner: {
        id: usersTable.id,
        namaLengkap: usersTable.namaLengkap,
        email: usersTable.email,
      },
      collaborator: {
        id: usersTableForCollab.id,
        namaLengkap: usersTableForCollab.namaLengkap,
        email: usersTableForCollab.email,
      },
    })
      .from(collaborations)
      .leftJoin(usersTable, eq(collaborations.ownerUserId, usersTable.id))
      .leftJoin(usersTableForCollab, eq(collaborations.collaboratorUserId, usersTableForCollab.id))
      .where(eq(collaborations.id, collaborationId));

    if (!collab) {
      return NextResponse.json({ error: 'Kolaborasi tidak ditemukan' }, { status: 404 });
    }

    // Check access using optional chaining (?.) to handle potential null values from leftJoin
    if (collab.owner?.id !== user.id && collab.collaborator?.id !== user.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    return NextResponse.json(collab);
  } catch (err: any) {
    console.error('Fetch collaboration error:', err);
    return NextResponse.json({ error: err.message || 'Gagal memuat detail kolaborasi' }, { status: 500 });
  }
}
