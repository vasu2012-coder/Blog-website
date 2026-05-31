import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/store';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const posts = db.posts.findByAuthor(user.id);
  const totalComments = posts.reduce((sum, p) => sum + db.comments.findByPost(p.id).length, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="hero-eyebrow">Your Space</div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user.name}. Here's your writing overview.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
        <div className="stat-card">
          <div className="stat-value">{posts.length}</div>
          <div className="stat-label">Posts Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalComments}</div>
          <div className="stat-label">Comments Received</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{posts.reduce((s, p) => s + Math.ceil(p.content.split(' ').length / 200), 0)}</div>
          <div className="stat-label">Total Read Minutes</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Posts list */}
        <div>
          <div className="section-header">
            <h2 className="section-title">Your Posts</h2>
            <Link href="/write" className="btn btn-accent btn-sm">✏️ New Post</Link>
          </div>

          {posts.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 0' }}>
              <h3>No posts yet</h3>
              <p style={{ marginBottom: '20px' }}>Your stories are waiting to be told.</p>
              <Link href="/write" className="btn btn-accent">Write Your First Post</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {posts.map(post => {
                const comments = db.comments.findByPost(post.id);
                return (
                  <div key={post.id} className="card" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <Link href={`/blog/${post.slug}`}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink)')}
                          >
                            {post.title}
                          </h3>
                        </Link>
                        <div style={{ display: 'flex', gap: '14px', fontSize: '0.8125rem', color: 'var(--warm-gray)' }}>
                          <span>{formatDate(post.createdAt)}</span>
                          <span>💬 {comments.length} comments</span>
                          <span>~{Math.max(1, Math.ceil(post.content.split(' ').length / 200))} min</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                          {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <Link href={`/write?edit=${post.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px', fontSize: '1.0625rem' }}>Your Profile</h3>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
              <div className="avatar avatar-lg">{user.avatar}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--warm-gray)' }}>{user.email}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--warm-gray)', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
              Member since {formatDate(user.createdAt)}
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/write" className="btn btn-accent" style={{ justifyContent: 'center' }}>✏️ Write New Post</Link>
              <Link href="/" className="btn btn-ghost" style={{ justifyContent: 'center' }}>📖 Browse All Posts</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
