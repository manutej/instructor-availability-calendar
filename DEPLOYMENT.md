# Deployment Guide - Calendar Availability System

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Git repository initialized
- Vercel account (or other hosting platform)

### Environment Setup

1. **Create environment file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Configure required variables**:
   ```bash
   # .env.local
   INSTRUCTOR_PASSWORD=your_secure_password_here
   NEXT_PUBLIC_URL=https://your-production-url.com
   ```

3. **Test locally**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Login with your INSTRUCTOR_PASSWORD
   ```

---

## Deployment Platforms

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Built for Next.js
- Zero-config deployment
- Automatic HTTPS
- Edge network CDN
- Free tier available

**Steps**:

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via GitHub** (easiest):
   - Push code to GitHub
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `INSTRUCTOR_PASSWORD`: Your secure password
     - `NEXT_PUBLIC_URL`: Your Vercel URL (e.g., `https://mycalendar.vercel.app`)
   - Click "Deploy"

3. **Deploy via CLI**:
   ```bash
   vercel
   # Follow prompts
   # Set environment variables when asked
   ```

4. **Configure custom domain** (optional):
   - Go to project settings in Vercel dashboard
   - Add custom domain
   - Update `NEXT_PUBLIC_URL` to match

**Production URL**: `https://your-project.vercel.app`

---

### Option 2: Netlify

**Steps**:

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build for production**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Set environment variables**:
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add `INSTRUCTOR_PASSWORD` and `NEXT_PUBLIC_URL`

---

### Option 3: Docker + Self-Hosted

**Dockerfile** (create in project root):
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**docker-compose.yml** (optional):
```yaml
version: '3.8'

services:
  calendar:
    build: .
    ports:
      - "3000:3000"
    environment:
      - INSTRUCTOR_PASSWORD=${INSTRUCTOR_PASSWORD}
      - NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}
    restart: unless-stopped
```

**Deploy**:
```bash
docker-compose up -d
```

---

## Production Checklist

### Security

- [ ] Set strong `INSTRUCTOR_PASSWORD` (20+ characters, random)
- [ ] Enable HTTPS (automatic with Vercel/Netlify)
- [ ] Verify security headers in `next.config.ts`
- [ ] Never commit `.env.local` to git
- [ ] Rotate password regularly

### Performance

- [ ] Test build succeeds: `npm run build`
- [ ] Check bundle size: `npm run build` output
- [ ] Test on slow network (Chrome DevTools throttling)
- [ ] Verify images load quickly
- [ ] Test on mobile devices

### Data Backup

- [ ] Export calendar data regularly
- [ ] Store backups in secure location (Google Drive, Dropbox)
- [ ] Test import functionality
- [ ] Document recovery procedure

### Testing

- [ ] Login works with password
- [ ] Dashboard loads after login
- [ ] Calendar displays correctly
- [ ] Export data downloads JSON file
- [ ] Import data restores from JSON
- [ ] Logout redirects to login
- [ ] Protected routes require auth

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `INSTRUCTOR_PASSWORD` | ✅ Yes | Password for dashboard access | `super_secure_password_123!` |
| `NEXT_PUBLIC_URL` | ✅ Yes | Public URL for calendar sharing | `https://mycalendar.com` |
| `NEXT_PUBLIC_USE_DATABASE` | ❌ No | Enable database (future) | `false` (default) |
| `DATABASE_URL` | ❌ No | PostgreSQL connection (future) | `postgresql://...` |
| `NODE_ENV` | Auto | Environment mode | `production` |

---

## Monitoring & Maintenance

### Weekly Tasks
- Export calendar data backup
- Check error logs (Vercel/Netlify dashboard)
- Test login functionality

### Monthly Tasks
- Rotate `INSTRUCTOR_PASSWORD`
- Update dependencies: `npm update`
- Review and delete old backups

### Troubleshooting

**Problem**: Login fails with correct password
- **Solution**: Check `INSTRUCTOR_PASSWORD` is set correctly in hosting platform
- **Check**: Environment variables in Vercel/Netlify dashboard

**Problem**: Build fails
- **Solution**: Run `npm run build` locally to see error
- **Check**: All dependencies installed: `npm install`

**Problem**: Export/Import not working
- **Solution**: Clear browser localStorage and try again
- **Check**: Browser console for JavaScript errors

**Problem**: Slow page loads
- **Solution**: Check network tab in browser DevTools
- **Check**: Vercel/Netlify analytics for performance metrics

---

## Migration to Database (Future)

When ready to migrate from localStorage to PostgreSQL:

1. **Set up database**:
   ```bash
   # Example: Vercel Postgres
   vercel postgres create
   ```

2. **Update environment**:
   ```bash
   NEXT_PUBLIC_USE_DATABASE=true
   DATABASE_URL=postgresql://...
   ```

3. **Export current data**:
   - Use dashboard export function
   - Save JSON file

4. **Run migration**:
   ```bash
   npm run migrate
   ```

5. **Import data**:
   - Use dashboard import function
   - Upload saved JSON file

---

## Support

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Environment Variables Guide](https://nextjs.org/docs/basic-features/environment-variables)

### Common Issues
- Check GitHub Issues for known problems
- Review application logs in hosting dashboard
- Test locally with `npm run build && npm start`

---

**Status**: Ready for production deployment
**Last Updated**: 2025-12-16
**Estimated Setup Time**: 15-30 minutes
