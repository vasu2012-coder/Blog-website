import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const posts = db.posts.findAll();
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    const { title, content, excerpt, tags } = await req.json();
    if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });

    const post = db.posts.create({
      title: title.trim(),
      content: content.trim(),
      excerpt: (excerpt?.trim() || content.trim().slice(0, 160) + '...'),
      tags: Array.isArray(tags) ? tags : [],
      authorId: user.id,
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
