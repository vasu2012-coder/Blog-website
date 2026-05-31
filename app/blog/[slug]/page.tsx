import { notFound } from 'next/navigation';
import { db } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';
import CommentsSection from '@/components/CommentsSection';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function renderContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
    if (line.startsWith('# ')) return <h2 key={i}>{line.slice(2)}</h2>;
    if (line.trim() === '') return <br key={i} />;
    // Handle inline code
    const parts = line.split(/(`[^`]+`)/g);
    return (
      <p key={i}>
        {parts.map((part, j) =>
          part.startsWith('`') && part.endsWith('`')
            ? <code key={j}>{part.slice(1, -1)}</code>
            : part
        )}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = db.posts.findBySlug(params.slug);
  if (!post) notFound();

  const author = db.users.findById(post.authorId);
  const comments = db.comments.findByPost(post.id).map(c => ({
    ...c,
    author: db.users.findById(c.authorId),
  }));
  const currentUser = await getCurrentUser();
  const isAuthor = currentUser?.id === post.authorId;

  return (
    <article className="post-detail">
      <div className="post-detail-header">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {post.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
        <h1 className="post-detail-title">{post.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginTop: '20px' }}>
          <div className="post-author-row">
            {author && <div className="avatar avatar-lg">{author.avatar}</div>}
            <div className="post-author-info">
              <strong>{author?.name || 'Unknown'}</strong>
              <span>{formatDate(post.createdAt)} · {Math.max(1, Math.ceil(post.content.split(' ').length / 200))} min read</span>
            </div>
          </div>
          {isAuthor && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href={`/write?edit=${post.id}`} className="btn btn-ghost btn-sm">Edit</Link>
              <DeleteButton postId={post.id} />
            </div>
          )}
        </div>
      </div>

      <div className="post-content">
        {renderContent(post.content)}
      </div>

      <CommentsSection
        postId={post.id}
        comments={comments}
        currentUser={currentUser ? { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar } : null}
      />
    </article>
  );
}

function DeleteButton({ postId }: { postId: string }) {
  return (
    <form action={`/api/posts/${postId}`} method="POST">
      <input type="hidden" name="_method" value="DELETE" />
      <button
        type="submit"
        className="btn btn-ghost btn-sm"
        style={{ color: 'var(--accent)', borderColor: 'var(--accent-muted)' }}
        formAction={`/api/posts/${postId}/delete`}
      >
        Delete
      </button>
    </form>
  );
}
