# ✦ Inkwell — Blog Platform with Comments

A full-stack blogging platform built with **Next.js 14 App Router**. Features user registration, login, blog post management, and a comment system — deployable to **Vercel** in minutes.

## ✨ Features

- 🔐 **Authentication** — Register, login, logout with JWT cookies
- ✏️ **Blog Posts** — Create, edit, delete posts with Markdown-style formatting
- 💬 **Comments** — Real-time comment section per post
- 📊 **Dashboard** — Personal stats and post management
- 🎨 **Beautiful Design** — Editorial serif typography, warm cream palette, smooth animations
- ⚡ **Zero-config Vercel deploy** — Works out of the box

## 🚀 Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Set `JWT_SECRET` as an environment variable in the Vercel dashboard.

### Option 2: GitHub + Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variable: `JWT_SECRET` = any long random string
4. Click **Deploy** ✅

## 💻 Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local and set JWT_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo account:** `alex@example.com` / `password`

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Auth | JWT + HTTP-only cookies |
| Database | In-memory store (global state) |
| Styling | Pure CSS with CSS variables |
| Deployment | Vercel |

## ⚠️ Note on Data Persistence

This app uses an **in-memory store** which resets on each Vercel cold start. For persistent data in production, connect a real database:

- **Vercel Postgres** — Easiest (1-click in Vercel dashboard)
- **PlanetScale** — MySQL-compatible serverless DB
- **MongoDB Atlas** — Free tier available

Replace `lib/store.ts` with your DB of choice.

## 📁 Project Structure

```
app/
├── page.tsx              # Home feed
├── blog/[slug]/          # Post detail + comments
├── write/                # Create/edit posts
├── dashboard/            # User dashboard
├── login/                # Auth pages
├── register/
└── api/
    ├── auth/             # login, register, logout
    ├── posts/            # CRUD for posts
    └── user/             # Current user info
components/
├── NavBar.tsx
└── CommentsSection.tsx
lib/
├── store.ts              # In-memory data store
└── auth.ts               # JWT utilities
```

---

Built with ❤️ as an internship project.
