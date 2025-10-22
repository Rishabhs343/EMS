# 🚀 Quick Deployment Guide

## Employee Management System

This guide provides quick deployment options for the Employee Management System.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Docker (for containerized deployment)
- Vercel account (for Vercel deployment)

---

## 🚀 Quick Start Options

### Option 1: Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment (create .env.local with your database URL)
cp .env.example .env.local
# Edit .env.local with your database configuration

# 3. Setup database
npm run db:generate
npm run db:push
npm run db:seed

# 4. Start development server
npm run dev
```

**Access:** http://localhost:3000

**Default Login:**
- Admin: `admin@company.com` / `admin123`
- HR: `hr@company.com` / `hr123`

---

### Option 2: Docker Deployment (Recommended)

```bash
# 1. Build and start all services
docker-compose up -d --build

# 2. Wait for services to start (about 30 seconds)
# 3. Run database setup
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed

# 4. Access the application
open http://localhost:3000
```

**Or use the deployment script:**
```bash
./deploy.sh docker
```

---

### Option 3: Vercel Deployment

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy to Vercel
vercel

# 3. Set environment variables in Vercel dashboard:
#    - DATABASE_URL: Your PostgreSQL connection string
#    - JWT_SECRET: A secure random string
#    - NEXT_PUBLIC_APP_URL: Your Vercel app URL

# 4. Run database migrations
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed

# 5. Redeploy
vercel --prod
```

**Or use the deployment script:**
```bash
./deploy.sh vercel
```

---

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Application Configuration
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🐳 Docker Commands

```bash
# Build and start services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down

# Rebuild and restart
npm run docker:build
npm run docker:up
```

---

## 📊 Database Management

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database (WARNING: This will delete all data)
npm run db:reset
```

---

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps
   
   # Check database logs
   docker-compose logs db
   ```

2. **Application Won't Start**
   ```bash
   # Check application logs
   docker-compose logs app
   
   # Check if all environment variables are set
   docker-compose exec app env | grep -E "(DATABASE_URL|JWT_SECRET)"
   ```

3. **Build Failures**
   ```bash
   # Clear cache and rebuild
   docker-compose down
   docker system prune -f
   docker-compose up -d --build
   ```

---

## 🌐 Production Considerations

### Security
- Change default passwords
- Use strong JWT secrets
- Enable HTTPS
- Set up proper firewall rules

### Performance
- Use a production database (not local PostgreSQL)
- Enable database connection pooling
- Set up monitoring and logging
- Use a CDN for static assets

### Monitoring
- Set up application monitoring
- Monitor database performance
- Set up log aggregation
- Create backup strategies

---

## 📞 Support

If you encounter any issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Ensure all services are running: `docker-compose ps`
4. Check the troubleshooting section above

---

**Happy Deploying! 🎉**
