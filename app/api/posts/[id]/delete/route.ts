import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', _.url));

  const post = db.posts.findById(params.id);
  if (post && post.authorId === user.id) db.posts.delete(params.id);

  return NextResponse.redirect(new URL('/dashboard', _.url));
}
