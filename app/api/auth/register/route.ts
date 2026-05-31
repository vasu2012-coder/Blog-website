import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/store';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name?.trim() || !email?.trim() || !password) return NextResponse.json({ error: 'All fields required.' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    if (db.users.findByEmail(email.toLowerCase())) return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });

    const hashed = hashPassword(password);
    const user = db.users.create({ name: name.trim(), email: email.toLowerCase().trim(), password: hashed });
    const token = signToken(user.id);
    cookies().set('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return NextResponse.json({ user: { id: user.id, name: user.name, avatar: user.avatar } });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}