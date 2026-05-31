'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface UserInfo { id: string; name: string; avatar: string; }

export default function NavBar() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/user').then(r => r.ok ? r.json() : null).then(d => d?.user ? setUser(d.user) : setUser(null)).catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <nav>
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          ✦ Ink<span>well</span>
        </Link>
        <ul className="nav-links">
          <li><Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link></li>
          {user && <li><Link href="/write" className={pathname === '/write' ? 'active' : ''}>Write</Link></li>}
          {user && <li><Link href="/dashboard" className={pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link></li>}
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <div className="dropdown" ref={dropRef}>
              <button
                onClick={() => setOpen(o => !o)}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <div className="avatar" title={user.name}>{user.avatar}</div>
              </button>
              {open && (
                <div className="dropdown-menu">
                  <div style={{ padding: '12px 16px 8px' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</div>
                  </div>
                  <div className="dropdown-sep" />
                  <Link href="/write" className="dropdown-item" onClick={() => setOpen(false)}>
                    ✏️ New Post
                  </Link>
                  <Link href="/dashboard" className="dropdown-item" onClick={() => setOpen(false)}>
                    📊 Dashboard
                  </Link>
                  <div className="dropdown-sep" />
                  <button className="dropdown-item danger" onClick={logout}>
                    ↩ Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link href="/register" className="btn btn-accent btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
