import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const comments = db.comments.findByPost(params.id).map(c => ({
    ...c,
    author: db.users.findById(c.authorId),
  }));
  return NextResponse.json({ comments });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to comment.' }, { status: 401 });

  const post = db.posts.findById(params.id);
  if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });

  try {
    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Comment cannot be empty.' }, { status: 400 });
    if (content.trim().length > 1000) return NextResponse.json({ error: 'Comment too long (max 1000 chars).' }, { status: 400 });

    const comment = db.comments.create({ postId: params.id, authorId: user.id, content: content.trim() });
    return NextResponse.json({ comment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
