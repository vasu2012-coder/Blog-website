// lib/store.ts
// In-memory store (resets on cold start - for production use a DB like Vercel Postgres/PlanetScale)
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  createdAt: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  coverImage?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

// Seed data
const seedUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    avatar: 'AR',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

const seedPosts: Post[] = [
  {
    id: 'post-1',
    slug: 'getting-started-with-nextjs',
    title: 'Getting Started with Next.js 14',
    content: `Next.js 14 brings exciting new features that make building web applications faster and more enjoyable than ever. In this post, we'll explore the key changes and how to get started.\n\n## App Router\n\nThe App Router is now the recommended way to build Next.js applications. It uses React Server Components by default, which means better performance and smaller bundle sizes.\n\n## Server Actions\n\nServer Actions allow you to run server-side code directly from your components without creating API routes. This simplifies data mutations significantly.\n\n## Partial Prerendering\n\nThis experimental feature combines static and dynamic rendering on the same page, giving you the best of both worlds.\n\n## Getting Started\n\nInstall Next.js with: \`npx create-next-app@latest\`\n\nThen run \`npm run dev\` to start the development server. You'll see your app at localhost:3000.\n\nNext.js 14 is a significant step forward for the framework. Whether you're building a simple blog or a complex web application, it has everything you need.`,
    excerpt: 'Explore the exciting new features in Next.js 14 including the App Router, Server Actions, and Partial Prerendering.',
    authorId: 'user-1',
    tags: ['Next.js', 'React', 'Web Dev'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'post-2',
    slug: 'mastering-css-grid',
    title: 'Mastering CSS Grid in 2026',
    content: `CSS Grid has transformed how we build layouts on the web. Let's dive deep into modern grid techniques that will level up your CSS skills.\n\n## Basic Grid Setup\n\nDefine a grid container with \`display: grid\` and use \`grid-template-columns\` and \`grid-template-rows\` to define your layout.\n\n## Auto-fill and Auto-fit\n\nThese keywords allow you to create responsive grids without media queries:\n\`grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))\`\n\n## Subgrid\n\nSubgrid is now widely supported and solves the problem of aligning nested grid items to the parent grid.\n\n## Grid Areas\n\nNamed grid areas make complex layouts readable and maintainable. Define areas with \`grid-template-areas\` and place items using \`grid-area\`.\n\nCSS Grid combined with Flexbox gives you everything you need to build any layout imaginable.`,
    excerpt: 'A deep dive into modern CSS Grid techniques including subgrid, auto-fit, and named areas for building stunning layouts.',
    authorId: 'user-1',
    tags: ['CSS', 'Design', 'Frontend'],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const seedComments: Comment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    authorId: 'user-1',
    content: 'Great introduction! The App Router section was especially helpful for understanding the new paradigm.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// Global store (persists during server lifetime)
declare global {
  var __users: User[];
  var __posts: Post[];
  var __comments: Comment[];
}

if (!global.__users) global.__users = [...seedUsers];
if (!global.__posts) global.__posts = [...seedPosts];
if (!global.__comments) global.__comments = [...seedComments];

export const db = {
  users: {
    findByEmail: (email: string) => global.__users.find(u => u.email === email),
    findById: (id: string) => global.__users.find(u => u.id === id),
    create: (data: Omit<User, 'id' | 'createdAt' | 'avatar'>) => {
      const user: User = {
        ...data,
        id: uuidv4(),
        avatar: data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        createdAt: new Date().toISOString(),
      };
      global.__users.push(user);
      return user;
    },
  },
  posts: {
    findAll: () => [...global.__posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    findById: (id: string) => global.__posts.find(p => p.id === id),
    findBySlug: (slug: string) => global.__posts.find(p => p.slug === slug),
    findByAuthor: (authorId: string) => global.__posts.filter(p => p.authorId === authorId),
    create: (data: Omit<Post, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) => {
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
      const post: Post = {
        ...data,
        id: uuidv4(),
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      global.__posts.push(post);
      return post;
    },
    update: (id: string, data: Partial<Post>) => {
      const idx = global.__posts.findIndex(p => p.id === id);
      if (idx === -1) return null;
      global.__posts[idx] = { ...global.__posts[idx], ...data, updatedAt: new Date().toISOString() };
      return global.__posts[idx];
    },
    delete: (id: string) => {
      const idx = global.__posts.findIndex(p => p.id === id);
      if (idx === -1) return false;
      global.__posts.splice(idx, 1);
      global.__comments = global.__comments.filter(c => c.postId !== id);
      return true;
    },
  },
  comments: {
    findByPost: (postId: string) => global.__comments.filter(c => c.postId === postId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    create: (data: Omit<Comment, 'id' | 'createdAt'>) => {
      const comment: Comment = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
      global.__comments.push(comment);
      return comment;
    },
    delete: (id: string) => {
      const idx = global.__comments.findIndex(c => c.id === id);
      if (idx === -1) return false;
      global.__comments.splice(idx, 1);
      return true;
    },
  },
};
