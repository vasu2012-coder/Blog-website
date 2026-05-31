import Link from 'next/link';
import { db } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function readTime(content: string) {
  return Math.max(1, Math.ceil(content.split(' ').length / 200));
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const posts = db.posts.findAll();
  const currentUser = await getCurrentUser();

  const postsWithAuthors = posts.map(post => ({
    ...post,
    author: db.users.findById(post.authorId),
    commentCount: db.comments.findByPost(post.id).length,
  }));

  return (
    <div className="page-container">
      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">A place for ideas</div>
        <h1 className="hero-title">
          Where <em>stories</em><br />come to life.
        </h1>
        <p className="hero-body">
          Write freely. Read deeply. Connect with minds that matter. Inkwell is your corner of the internet.
        </p>
        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {currentUser ? (
            <Link href="/write" className="btn btn-primary btn-lg">✏️ Write Something</Link>
          ) : (
            <>
              <Link href="/register" className="btn btn-primary btn-lg">Start Writing Free</Link>
              <Link href="/login" className="btn btn-ghost btn-lg">Sign In</Link>
            </>
          )}
        </div>
      </section>

      {/* Posts */}
      <div className="deco-rule">Latest Stories</div>

      {postsWithAuthors.length === 0 ? (
        <div className="empty-state">
          <h3>No stories yet</h3>
          <p>Be the first to write something!</p>
          {currentUser && <Link href="/write" className="btn btn-accent" style={{ marginTop: '20px' }}>Write Now</Link>}
        </div>
      ) : (
        <div className="posts-grid">
          {postsWithAuthors.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <article className="card post-card">
                <div className="post-card-meta">
                  {post.author && (
                    <>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: '0.65rem' }}>{post.author.avatar}</div>
                      <span>{post.author.name}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <h2 className="post-card-title">{post.title}</h2>
                <p className="post-card-excerpt">{post.excerpt}</p>
                <div className="post-card-footer">
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--warm-gray)', whiteSpace: 'nowrap' }}>
                    <span>{readTime(post.content)} min read</span>
                    <span>💬 {post.commentCount}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
