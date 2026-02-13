# The Listening Room 🎻

A tournament-style instrument comparison app. Users select instruments, listen to A/B recordings, and vote for their favourite — round by round — until a winner emerges.

## Architecture

- **Frontend**: React + Vite + Tailwind (CDN)
- **Backend**: Supabase (Postgres database + Auth)
- **Hosting**: Vercel
- **Video**: YouTube IFrame API

## Setup

### 1. Supabase

1. Go to [supabase.com](https://supabase.com) and open your project (or create one)
2. Open **SQL Editor** → **New Query**
3. Paste the contents of `supabase/schema.sql` and click **Run**
4. This creates the `instruments` table, enables RLS, and seeds your initial data
5. Go to **Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 2. Create an Admin User

1. In Supabase, go to **Authentication → Users**
2. Click **Add User** → **Create New User**
3. Enter your email and a password
4. This account can log into `/admin` to manage instruments

### 3. Local Development

```bash
# Clone and install
cd listening-room
npm install

# Create your .env file
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# Run
npm run dev
```

Opens at http://localhost:5173

### 4. GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/listening-room.git
git push -u origin main
```

### 5. Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Add environment variables:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
4. Click **Deploy**

That's it! Vercel auto-deploys on every push to `main`.

## Managing Instruments

### Option A: Admin Panel (recommended)

1. Go to `yoursite.com/admin`
2. Log in with the admin user you created in Supabase
3. From here you can:
   - **Add** new instruments with YouTube URL, maker, year, tags
   - **Edit** any instrument details
   - **Toggle** instruments on/off (hidden from users but not deleted)
   - **Reorder** instruments with up/down arrows
   - **Delete** instruments permanently
   - **Add tags** for category filtering (e.g. "violin", "contemporary", "italian")
   - **Set custom thumbnails** to override the YouTube thumbnail

### Option B: Supabase Table Editor

1. Open your Supabase dashboard
2. Go to **Table Editor → instruments**
3. Edit directly in the spreadsheet UI
4. Changes appear instantly on the live site (no redeploy needed)

## Database Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Auto-generated primary key |
| `name` | text | Full instrument name |
| `maker` | text | Maker/luthier name |
| `year` | text | Year of creation |
| `youtube_url` | text | Full YouTube URL |
| `thumbnail_url` | text | Optional custom thumbnail URL |
| `tags` | text[] | Array of tags for filtering |
| `sort_order` | int | Display order (lower = first) |
| `enabled` | boolean | Whether visible to users |
| `created_at` | timestamptz | Auto-set on creation |
| `updated_at` | timestamptz | Auto-updated on changes |

## Adding a New Instrument

The minimum you need is:
1. **Maker name** (e.g. "Anna Arietti")
2. **Full name** (e.g. "Violin by Anna Arietti, 2025 Cremona")
3. **YouTube URL** (e.g. "https://www.youtube.com/watch?v=O6CeZ8NGBZE")

Everything else (tags, thumbnail, sort order) is optional.

## Project Structure

```
listening-room/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json          # SPA routing for Vercel
├── .env.example         # Environment variables template
├── supabase/
│   └── schema.sql       # Database schema + seed data
└── src/
    ├── main.jsx
    ├── App.jsx           # Router + layout
    ├── lib/
    │   └── supabase.js   # Supabase client + helpers
    ├── components/
    │   └── DualPlayer.jsx # YouTube A/B player
    └── pages/
        ├── ListeningRoom.jsx  # Public tournament flow
        └── Admin.jsx          # Admin panel (auth-protected)
```
