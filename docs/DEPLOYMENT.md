# Deployment Guide

This guide covers deploying Routine Guide to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Options](#deployment-options)
  - [Docker](#docker)
  - [Railway](#railway)
  - [Render](#render)
  - [Vercel](#vercel)
  - [AWS/DigitalOcean](#awsdigitalocean)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ database (or Supabase)
- Domain name (optional)
- SSL certificate (recommended)

## Environment Variables

Set these in your deployment platform:

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=another-secret-min-32-chars
API_PORT=3000
NODE_ENV=production

# Optional
CORS_ORIGIN=https://yourdomain.com
THROTTLE_TTL=60
THROTTLE_LIMIT=100
CRON_ENABLED=true
FCM_SERVER_KEY=your-fcm-key
```

## Deployment Options

### Docker

**Build and run:**

```bash
# Clone repo
git clone https://github.com/yourusername/routine-guide.git
cd routine-guide

# Build image
docker build -t routine-guide -f apps/api/Dockerfile .

# Run container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e JWT_REFRESH_SECRET="..." \
  --name routine-guide \
  routine-guide
```

**Using docker-compose:**

```bash
# Edit .env file
cp .env.example .env
nano .env

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f api

# Run migrations
docker-compose exec api npm run db:migrate
```

### Railway

1. **Connect GitHub repo** to Railway
2. **Add PostgreSQL** service
3. **Set environment variables** in dashboard
4. **Deploy** automatically on push

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm run start:prod
```

### Render

1. **Create new Web Service**
2. **Connect GitHub repo**
3. **Set environment**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
4. **Add PostgreSQL** database
5. **Set environment variables**

### Vercel

Vercel is better for frontend, but you can deploy API as serverless functions:

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts

**Note:** You may need to adapt code for serverless (use `/api` routes).

### AWS/DigitalOcean

**EC2/Droplet Setup:**

```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repo
git clone https://github.com/yourusername/routine-guide.git
cd routine-guide

# Install deps
npm install

# Build
npm run build

# Run migrations
npm run db:migrate

# Start with PM2
pm2 start apps/api/dist/main.js --name routine-guide-api
pm2 save
pm2 startup

# Start worker (optional)
pm2 start apps/workers/dist/index.js --name routine-guide-worker
```

**Nginx reverse proxy:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**SSL with Let's Encrypt:**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Database Setup

### Supabase

1. **Create project** at [supabase.com](https://supabase.com)
2. **Copy connection string** from Settings → Database
3. **Run migrations**:
   ```bash
   DATABASE_URL="postgresql://..." npm run db:migrate
   ```
4. **Enable RLS** (Row Level Security) in Supabase dashboard

### Self-hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb routine_guide

# Create user
sudo -u postgres createuser --interactive

# Set password
sudo -u postgres psql
\password your_user
```

## Post-Deployment

### Health Check

```bash
curl https://yourdomain.com/api/docs
```

Should return Swagger documentation.

### Run Migrations

```bash
npm run db:migrate
```

### Seed Database (optional)

```bash
npm run db:seed
```

### Monitor Logs

**Docker:**
```bash
docker logs -f routine-guide
```

**PM2:**
```bash
pm2 logs routine-guide-api
```

### Set up Monitoring

- **Sentry** for error tracking
- **Datadog/New Relic** for APM
- **UptimeRobot** for uptime monitoring

### Backup Database

**Automated backups (Supabase):** Enabled by default

**Manual backup:**
```bash
pg_dump -h host -U user -d routine_guide > backup.sql
```

## Troubleshooting

### Port already in use
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database connection fails
- Check `DATABASE_URL` format
- Verify firewall rules
- Check SSL requirements (`?sslmode=require`)

### Prisma client not generated
```bash
npm run db:generate
```

### Migration failed
```bash
# Reset database (⚠️ DANGER: deletes all data)
npm run db:reset

# Or manually fix
npm run db:migrate:dev
```

## Security Checklist

- [ ] Use HTTPS
- [ ] Set strong JWT secrets
- [ ] Enable CORS properly
- [ ] Set rate limits
- [ ] Use environment variables
- [ ] Enable RLS on database
- [ ] Regular security updates
- [ ] Monitor logs for anomalies

## Scaling

### Horizontal Scaling
- Deploy multiple API instances
- Use load balancer (Nginx, AWS ALB)
- Share PostgreSQL instance

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add database indexes

### Caching
- Add Redis for session storage
- Cache analytics results
- Use CDN for static assets

---

For questions, open an issue on GitHub.
