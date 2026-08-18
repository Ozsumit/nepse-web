# NEPSE Portfolio Tracker

A modern, minimalist Next.js application for tracking Nepal Stock Exchange (NEPSE) portfolio with real-time price alerts via email, SMS, and Telegram.

## Features

- **Real-time Portfolio Tracking**: Monitor your NEPSE stocks with live prices from multiple sources
- **Price Target Alerts**: Set buy/sell targets and get instant notifications
- **Multi-channel Notifications**: Email, SMS, and Telegram alerts
- **Modern Clean UI**: Minimalist design with dark mode support
- **Admin Authentication**: Secure JWT-based authentication
- **Cloudflare Ready**: Deploy to Cloudflare Pages with edge functions

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT tokens with secure HTTP-only cookies
- **Backend API**: Cloudflare Workers (separate repository)
- **Deployment**: Cloudflare Pages
- **Email**: Cloudflare Email Service
- **SMS**: Twilio (configured on backend)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Cloudflare account (for deployment)

### Installation

```bash
# Clone the repository
git clone <your-repo>
cd nepse-portfolio-tracker

# Install dependencies
npm install

# Copy environment variables
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your values

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected dashboard pages
│   │   ├── watchlist/     # Stock watchlist management
│   │   └── notifications/ # Notification settings
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components (Header, etc.)
│   └── Providers.tsx      # Context providers
├── context/
│   ├── AuthContext.tsx    # Authentication state
│   └── NotificationContext.tsx # Notification settings
├── lib/
│   ├── api.ts             # API client
│   └── utils.ts           # Utility functions
├── types/
│   └── api.ts             # TypeScript types
└── middleware.ts          # Auth middleware
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `EMAIL_FROM` | Sender email address | For email |
| `EMAIL_API_TOKEN` | Cloudflare Email API token | For email |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | For SMS |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | For SMS |
| `TWILIO_FROM_NUMBER` | Twilio sender number | For SMS |

## Deployment

### Cloudflare Pages (Recommended)

1. Push your code to GitHub/GitLab
2. Go to Cloudflare Pages dashboard
3. Connect your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.vercel/output/static`
5. Add environment variables in Pages settings
6. Deploy

### Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run build
wrangler pages deploy .vercel/output/static --project-name=nepse-tracker
```

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## API Integration

The frontend communicates with the Cloudflare Workers API at `https://nepse-unified-api.pokhrelsumit36.workers.dev`. Key endpoints:

- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/portfolio` - Get portfolio
- `POST /api/v1/portfolio` - Add stock
- `DELETE /api/v1/portfolio/:symbol` - Remove stock
- `GET /api/health` - Health check

## Features Detail

### Authentication
- JWT-based auth with 30-day expiry
- Secure password hashing (PBKDF2)
- Protected routes via middleware
- Token stored in localStorage (consider httpOnly cookies for production)

### Portfolio Management
- Add/remove stocks with buy/sell targets
- Real-time LTP from multiple NEPSE sources
- All-time high tracking
- Visual status indicators (BUY hit, SELL hit, monitoring)

### Notifications
- Email alerts via Cloudflare Email Service
- SMS alerts via Twilio (backend)
- Telegram bot integration
- Configurable alert types (buy, sell, ATH)

## Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT# nepse-web
