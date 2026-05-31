'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author?: { name: string; avatar: string } | null;
}

interface Props {
  postId: string;
  comments: Comment[];
  currentUser: { id: string; name: string; avatar: string } | null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function CommentsSection({ postId, comments: initial, currentUser }: Props) {
  const [comments, setComments] = useState(initial);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to post'); return; }
      setComments(prev => [...prev, {
        ...data.comment,
        author: currentUser ? { name: currentUser.name, avatar: currentUser.avatar } : null,
      }]);
      setText('');
      router.refresh();
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="comments-section">
      <h3 className="comments-title">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h3>

      {comments.length === 0 && (
        <p style={{ color: 'var(--warm-gray)', fontSize: '0.9375rem', marginBottom: '24px' }}>
          No comments yet. Be the first to share your thoughts!
        </p>
      )}

      {comments.map(c => (
        <div key={c.id} className="comment-item">
          <div className="avatar">{c.author?.avatar || '?'}</div>
          <div className="comment-body">
            <div className="comment-header">
              <span className="comment-author">{c.author?.name || 'Anonymous'}</span>
              <span className="comment-date">{timeAgo(c.createdAt)}</span>
            </div>
            <p className="comment-text">{c.content}</p>
          </div>
        </div>
      ))}

      {currentUser ? (
        <div className="comment-form">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div className="avatar" style={{ marginTop: '4px', flexShrink: 0 }}>{currentUser.avatar}</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea
                className="form-input"
                placeholder="Share your thoughts..."
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
              {error && <p className="alert alert-error">{error}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={submit}
                  disabled={loading || !text.trim()}
                  style={{ opacity: loading || !text.trim() ? 0.6 : 1 }}
                >
                  {loading ? <span className="spinner" /> : ''}
                  {loading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: 'var(--cream)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--warm-gray)', marginBottom: '12px' }}>
            Sign in to join the conversation
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <a href="/login" className="btn btn-primary btn-sm">Sign In</a>
            <a href="/register" className="btn btn-ghost btn-sm">Register</a>
          </div>
        </div>
      )}
    </div>
  );
}
