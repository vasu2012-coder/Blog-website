'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const id = params.get('edit');
    if (id) {
      setEditId(id);
      fetch(`/api/posts/${id}`).then(r => r.json()).then(d => {
        if (d.post) {
          setTitle(d.post.title);
          setContent(d.post.content);
          setExcerpt(d.post.excerpt);
          setTags(d.post.tags.join(', '));
        }
      });
    }
  }, [params]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) { setError('Title and content are required.'); return; }
    setLoading(true); setError('');
    try {
      const body = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.trim().slice(0, 160) + '...',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      const res = editId
        ? await fetch(`/api/posts/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save'); return; }
      router.push(`/blog/${data.post.slug}`);
      router.refresh();
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="write-container">
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          {editId ? 'Edit Post' : 'Write a New Post'}
        </h1>
        <p style={{ marginTop: '6px', color: 'var(--warm-gray)', fontSize: '0.9375rem' }}>
          {editId ? 'Update your story below.' : 'Share your thoughts, ideas, and expertise with the world.'}
        </p>
      </div>

      <div className="write-form">
        <input
          className="write-title-input"
          placeholder="Your story title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <div className="form-group">
          <label className="form-label">Short excerpt (optional)</label>
          <input
            className="form-input"
            placeholder="A brief description shown in post cards..."
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Content</label>
          <p style={{ fontSize: '0.8rem', color: 'var(--warm-gray)', marginTop: '-2px' }}>
            Supports ## Headings and `inline code`
          </p>
          <textarea
            className="write-content-input form-input"
            placeholder="Write your story here...&#10;&#10;## Section Heading&#10;&#10;Your content here. Use `code` for inline code."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tags (comma-separated)</label>
          <input
            className="form-input"
            placeholder="e.g. Technology, Design, Programming"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="write-toolbar">
          <p style={{ fontSize: '0.8125rem', color: 'var(--warm-gray)' }}>
            {content.split(' ').filter(Boolean).length} words · ~{Math.max(1, Math.ceil(content.split(' ').filter(Boolean).length / 200))} min read
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
            <button
              className="btn btn-accent"
              onClick={handleSubmit}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <span className="spinner" /> : ''}
              {loading ? 'Publishing...' : editId ? 'Update Post' : 'Publish Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
