import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const post = db.posts.findById(params.id);
  if (!post) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const post = db.posts.findById(params.id);
  if (!post) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  if (post.authorId !== user.id) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

  try {
    const { title, content, excerpt, tags } = await req.json();
    const updated = db.posts.update(params.id, {
      title: title?.trim() || post.title,
      content: content?.trim() || post.content,
      excerpt: excerpt?.trim() || post.excerpt,
      tags: Array.isArray(tags) ? tags : post.tags,
    });
    return NextResponse.json({ post: updated });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const post = db.posts.findById(params.id);
  if (!post) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  if (post.authorId !== user.id) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

  db.posts.delete(params.id);
  return NextResponse.json({ ok: true });
}
