import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/store';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });

    const user = db.users.findByEmail(email.toLowerCase().trim());
    if (!user) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

    const token = signToken(user.id);
    cookies().set('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return NextResponse.json({ user: { id: user.id, name: user.name, avatar: user.avatar } });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
