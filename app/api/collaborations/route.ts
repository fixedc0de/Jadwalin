import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collaborations, users } from '@/lib/db-schema';
import { eq, and, or } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

// POST /api/collaborations/invite - Send collaboration invite
export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { collaboratorEmail, permissionLevel = 'view' } = body as { 
      collaboratorEmail: string; 
      permissionLevel?: 'view' | 'edit' 
    };

    if (!collaboratorEmail) {
      return NextResponse.json({ error: 'Email collaborator wajib diisi' }, { status: 400 });
    }

    // Find the collaborator by email
    const [collaborator] = await db.select()
      .from(users)
      .where(eq(users.email, collaboratorEmail));

    if (!collaborator) {
      return NextResponse.json({ error: 'User dengan email tersebut tidak ditemukan' }, { status: 404 });
    }

    // Cannot invite yourself
    if (collaborator.id === user.id) {
      return NextResponse.json({ error: 'Tidak dapat mengundang diri sendiri' }, { status: 400 });
    }

    // Check for existing invitation
    const [existingInvite] = await db.select()
      .from(collaborations)
      .where(
        and(
          eq(collaborations.ownerUserId, user.id),
          eq(collaborations.collaboratorUserId, collaborator.id),
          eq(collaborations.status, 'pending')
        )
      );

    if (existingInvite) {
      return NextResponse.json({ error: 'Undangan sudah pernah dikirim' }, { status: 409 });
    }

    // Check if already collaborating
    const [existingCollab] = await db.select()
      .from(collaborations)
      .where(
        and(
          eq(collaborations.ownerUserId, user.id),
          eq(collaborations.collaboratorUserId, collaborator.id),
          or(
            eq(collaborations.status, 'accepted'),
            eq(collaborations.status, 'pending')
          )
        )
      );

    if (existingCollab && existingCollab.status === 'accepted') {
      return NextResponse.json({ error: 'User ini sudah menjadi collaborator' }, { status: 409 });
    }

    // Create new collaboration invite
    const [newCollab] = await db.insert(collaborations)
      .values({
        ownerUserId: user.id,
        collaboratorUserId: collaborator.id,
        permissionLevel: permissionLevel || 'view',
        status: 'pending',
      })
      .returning();

    return NextResponse.json({
      id: newCollab.id,
      collaborator: {
        id: collaborator.id,
        namaLengkap: collaborator.namaLengkap,
        email: collaborator.email,
      },
      permissionLevel: newCollab.permissionLevel,
      status: newCollab.status,
      invitedAt: newCollab.invitedAt,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Collaboration invite error:', err);
    return NextResponse.json({ error: err.message || 'Gagal mengirim undangan' }, { status: 500 });
  }
}

// GET /api/collaborations/my-invites - Get pending invites for current user
export async function GET(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Get pending invitations where user is the collaborator
    const invites = await db.select({
      id: collaborations.id,
      permissionLevel: collaborations.permissionLevel,
      status: collaborations.status,
      invitedAt: collaborations.invitedAt,
      respondedAt: collaborations.respondedAt,
      owner: {
        id: users.id,
        namaLengkap: users.namaLengkap,
        email: users.email,
      },
    })
      .from(collaborations)
      .leftJoin(users, eq(collaborations.ownerUserId, users.id))
      .where(
        and(
          eq(collaborations.collaboratorUserId, user.id),
          eq(collaborations.status, 'pending')
        )
      );

    return NextResponse.json(invites);
  } catch (err: any) {
    console.error('Fetch invites error:', err);
    return NextResponse.json({ error: err.message || 'Gagal memuat undangan' }, { status: 500 });
  }
}
