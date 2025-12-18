# Calendar Availability System

**Version**: 2.0 (MVP with Auth + Data Persistence)

Instructor calendar availability system with protected dashboard, data export/import, and production-ready deployment.

---

## Features

- **Protected Dashboard**: Simple password authentication for instructor access
- **Calendar Management**: Block/unblock dates (full day, AM, PM)
- **Data Export/Import**: JSON backup and restore functionality
- **Production Ready**: Optimized for Vercel/Netlify deployment
- **Mobile Responsive**: Works on all device sizes
- **Security Headers**: Production-grade security configuration

---

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
INSTRUCTOR_PASSWORD=your_secure_password_here
NEXT_PUBLIC_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to login.

**Login** with the password you set in `INSTRUCTOR_PASSWORD`.

---

## Authentication

### Simple Password Auth (MVP)

- **Route Protection**: `/dashboard`, `/api` routes require authentication
- **Session**: 7-day httpOnly cookie
- **Logout**: Click "Logout" in navigation
- **Security**: Password stored in environment variable only

**For Production**: Replace with proper auth system (NextAuth.js, Auth0, etc.)

---

## Data Persistence

### Current: localStorage + Export/Import

**Advantages**:
- Zero configuration
- No database setup required
- Full data control

**Backup Process**:
1. Go to `/dashboard/export`
2. Click "Export Calendar Data"
3. Save JSON file to secure location
4. Import via `/dashboard/import` if needed

### Future: PostgreSQL Database

See [DEPLOYMENT.md](./DEPLOYMENT.md) for database migration guide.

---

## Dashboard Features

### Navigation

- **Calendar** (`/dashboard`) - Main calendar view with blocking
- **Settings** (`/dashboard/settings`) - Slug management, public URL
- **Email Generator** (`/dashboard/email`) - Generate professional emails
- **Export Data** (`/dashboard/export`) - Download backup
- **Import Data** (`/dashboard/import`) - Restore from backup
- **Logout** - Clear session and return to login

### Data Export Format

```json
{
  "version": "1.0",
  "exportedAt": "2025-12-16T10:00:00Z",
  "availability": {
    "blockedDates": [
      { "date": "2026-01-15", "status": "full", "eventName": "Meeting" }
    ],
    "lastSync": "2025-12-16T09:00:00Z"
  },
  "profile": {
    "slug": "john-instructor",
    "displayName": "Dr. John Smith",
    "email": "john@example.com",
    "isPublic": true
  }
}
```

---

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `INSTRUCTOR_PASSWORD`: Your secure password
   - `NEXT_PUBLIC_URL`: Your Vercel URL
4. Deploy

**See**: [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide

### Other Platforms

- **Netlify**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Docker**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Self-hosted**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Project Structure

```
cal/
├── app/
│   ├── dashboard/          # Protected dashboard routes
│   │   ├── layout.tsx     # Auth wrapper + navigation
│   │   ├── page.tsx       # Calendar view
│   │   ├── export/        # Data export
│   │   └── import/        # Data import
│   ├── login/             # Login page
│   ├── api/
│   │   └── auth/          # Login/logout endpoints
│   └── middleware.ts      # Route protection
├── components/
│   ├── calendar/          # Calendar components
│   └── dashboard/         # Dashboard components
├── lib/
│   ├── auth.ts            # Authentication utilities
│   └── data/
│       └── persistence.ts # Data abstraction layer
├── types/                 # TypeScript definitions
├── .env.example          # Environment template
├── next.config.ts        # Production config
├── DEPLOYMENT.md         # Deployment guide
└── README.md             # This file
```

---

## Development

### Build for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

---

## Security

### Current Implementation (MVP)

- Simple password authentication
- httpOnly cookies (7-day expiration)
- Security headers (CSP, HSTS, etc.)
- Environment variable password storage
- Route-level protection via middleware

### Production Recommendations

1. **Replace password auth** with proper authentication:
   - NextAuth.js with OAuth providers
   - Auth0 or similar service
   - Magic link authentication

2. **Add rate limiting** on login endpoint

3. **Enable HTTPS** (automatic on Vercel/Netlify)

4. **Regular password rotation**

5. **Monitor access logs**

---

## Roadmap

### Current (MVP v2.0)
- ✅ Password authentication
- ✅ Protected dashboard
- ✅ Data export/import
- ✅ Production deployment config

### Phase 2 (Database + Public Sharing)
- [ ] PostgreSQL database integration
- [ ] Public calendar view (`/calendar/[slug]`)
- [ ] Email generation with verified dates
- [ ] .ics calendar file generation

### Phase 3 (Advanced Features)
- [ ] OAuth authentication (Google, GitHub)
- [ ] Real-time sync across devices
- [ ] Calendar analytics
- [ ] Booking system integration

---

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[specs/SPEC-V2.md](./specs/SPEC-V2.md)** - Full specification
- **[specs/CONSTITUTION.md](./specs/CONSTITUTION.md)** - Design principles

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Date Handling**: date-fns
- **Authentication**: Simple password (MVP)
- **Data Storage**: localStorage + JSON export

---

## Support

### Common Issues

**Q: Login fails with correct password**
- Check `INSTRUCTOR_PASSWORD` is set in `.env.local`
- Restart dev server after changing `.env.local`

**Q: Build fails**
- Run `npm install` to ensure all dependencies installed
- Check for TypeScript errors: `npx tsc --noEmit`

**Q: Export/Import not working**
- Check browser console for errors
- Clear localStorage and try again

### Getting Help

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
- Review application logs in browser console
- Test locally with production build: `npm run build && npm start`

---

**Built with Next.js** | **Deployed on Vercel** | **Pragmatic MVP Approach**
