# MailFlow — AI-Powered Email Marketing Platform

A complete SaaS email marketing platform with AI features, high deliverability, and automation workflows.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS, React Query |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7, BullMQ |
| AI | OpenAI GPT-4 |
| Billing | Stripe |
| Storage | MinIO (dev) / S3 (prod) |
| Proxy | Nginx |

## Quick Start (Development)

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/mailflow.git
cd mailflow
make install

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env — set DATABASE_URL, JWT secrets, OpenAI key

cp frontend/.env.example frontend/.env

# 3. Start all services
make dev

# 4. Run migrations + seed
make migrate
make seed

# 5. Open
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Swagger docs: http://localhost:3001/docs
# Prisma Studio: make studio → http://localhost:5555
# MinIO console: http://localhost:9001
```

## Production Deployment (VPS)

```bash
# On your VPS (Ubuntu 22.04+)
curl -o setup.sh https://raw.githubusercontent.com/YOUR_USERNAME/mailflow/main/scripts/setup-vps.sh
bash setup.sh yourdomain.com you@email.com
```

The setup script:
- Installs Docker + Docker Compose
- Configures UFW firewall
- Clones the repository
- Generates random secrets
- Gets Let's Encrypt SSL certificate
- Builds and starts all services
- Runs database migrations
- Configures automatic SSL renewal

For subsequent deploys:
```bash
bash /opt/mailflow/scripts/deploy.sh
```

## Features

### Email Sending
- Multi-SMTP provider support (test connection, failover)
- Domain authentication (SPF, DKIM, DMARC record generation)
- Email tracking: opens (pixel), clicks (link rewriting), unsubscribes
- Bounce and complaint handling

### Campaigns
- Rich email builder with HTML editor + block system + device preview
- A/B testing (subject lines)
- Campaign scheduling
- Duplicate and template system

### Contacts
- CSV import (async via BullMQ)
- Lists, segments, and tags
- Custom fields
- Subscription management

### Automation
- Visual workflow builder (React Flow)
- Triggers: form submit, tag added, list join, date, webhook
- Actions: send email, wait, add tag, update field, webhook

### AI Features (GPT-4)
- Generate full marketing emails from a prompt
- Generate subject line variants with estimated open rates
- Analyze campaign for deliverability/spam issues
- Optimize subject lines
- Best send time recommendations by industry and timezone

### Analytics
- Dashboard with 30-day trend charts
- Per-campaign: opens, clicks, bounces, unsubscribes
- Device breakdown
- Geographic data
- Link click heatmap

### SaaS / Multi-tenant
- Organization-based multi-tenancy
- Team invitations with roles (Owner, Admin, Member)
- Stripe billing with plan limits
- API key management
- Audit log

## Environment Variables

See `backend/.env.example` for all required variables. Key ones:

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<random 64 chars>
JWT_REFRESH_SECRET=<random 64 chars>
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_ACCESS_KEY_ID=...
```

## API Documentation

Swagger UI available at `/docs` when the backend is running.

## Architecture

```
mailflow/
├── backend/               # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/      # JWT auth, register, login, refresh
│   │   │   ├── users/     # Profile, password
│   │   │   ├── organizations/ # Team, invites, API keys
│   │   │   ├── campaigns/ # Campaign CRUD + send
│   │   │   ├── contacts/  # Contacts, lists, CSV import
│   │   │   ├── templates/ # Email templates
│   │   │   ├── analytics/ # Stats + dashboard
│   │   │   ├── tracking/  # Open pixel + click redirect
│   │   │   ├── domains/   # DKIM/SPF/DMARC
│   │   │   ├── smtp/      # SMTP config + test
│   │   │   ├── queue/     # BullMQ processors
│   │   │   ├── ai/        # OpenAI features
│   │   │   ├── automation/ # Workflow engine
│   │   │   └── billing/   # Stripe integration
│   │   └── prisma/        # Database service
│   └── prisma/
│       └── schema.prisma  # Full database schema
├── frontend/              # Next.js 14
│   └── src/
│       ├── app/           # App Router pages
│       ├── components/    # Reusable UI components
│       ├── lib/           # API client, utilities
│       └── store/         # Zustand state
├── nginx/                 # Reverse proxy configs
├── scripts/               # VPS setup + deploy
├── docker-compose.yml     # Development
├── docker-compose.prod.yml # Production
└── Makefile               # Common commands
```
