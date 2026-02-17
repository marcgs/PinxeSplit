# PinxeSplit

A modern expense splitting application built with React, TypeScript, and Express.

## Features

- **Split Expenses**: Easily divide costs among friends and groups
- **Multiple Split Types**: Equal, percentage, exact amounts, or shares
- **Group Management**: Organize expenses by groups
- **Multi-Currency Support**: Handle expenses in different currencies
- **Progressive Web App**: Install on mobile devices for a native-like experience
- **Real-time Balance Tracking**: See who owes what at a glance

## Tech Stack

### Frontend (`apps/web`)
- **React 18** with TypeScript
- **Vite** for blazing fast development
- **React Router v7** for navigation
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **PWA** with Workbox for offline support

### Backend (`apps/api`)
- **Express** with TypeScript
- **Prisma** ORM for database access
- **Zod** for validation
- **PostgreSQL** database

### Shared (`packages/shared`)
- Common TypeScript types
- Zod validation schemas
- Currency utilities

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0
- PostgreSQL (for production)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/marcgs/PinxeSplit.git
cd PinxeSplit
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Web app .env
cp apps/web/.env.example apps/web/.env

# API .env
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your configuration (especially JWT_SECRET)
```

4. Start the development servers:
```bash
# Start both web and API servers
npm run dev

# Or start individually:
npm run dev --workspace=apps/web
npm run dev --workspace=apps/api
```

### Development

The web app will be available at `http://localhost:5173`
The API server will be available at `http://localhost:3001`

### Building for Production

```bash
# Build all workspaces
npm run build

# Build specific workspace
npm run build --workspace=apps/web
```

### Testing

```bash
# Run all tests
npm run test

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

## Project Structure

```
PinxeSplit/
├── apps/
│   ├── web/                 # React PWA frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable React components
│   │   │   ├── pages/       # Page components
│   │   │   ├── styles/      # Global styles
│   │   │   └── lib/         # Utility functions
│   │   └── public/          # Static assets
│   └── api/                 # Express backend
│       ├── src/
│       │   ├── config/      # Configuration
│       │   └── middleware/  # Express middleware
│       └── prisma/          # Database schema
├── packages/
│   └── shared/              # Shared code between apps
│       ├── types/           # TypeScript types
│       ├── schemas/         # Zod validation schemas
│       └── utils/           # Utility functions
└── turbo.json              # Turborepo configuration
```

## Available Scripts

### Root Level
- `npm run dev` - Start all development servers
- `npm run build` - Build all workspaces
- `npm run lint` - Lint all workspaces
- `npm run typecheck` - Type check all workspaces
- `npm run test` - Run tests in all workspaces

### Web App (`apps/web`)
- `npm run dev --workspace=apps/web` - Start Vite dev server
- `npm run build --workspace=apps/web` - Build for production
- `npm run preview --workspace=apps/web` - Preview production build

### API (`apps/api`)
- `npm run dev --workspace=apps/api` - Start Express server with hot reload
- `npm run build --workspace=apps/api` - Build TypeScript
- `npm run start --workspace=apps/api` - Start production server
- `npm run prisma:generate --workspace=apps/api` - Generate Prisma client
- `npm run prisma:migrate --workspace=apps/api` - Run database migrations

## Progressive Web App (PWA)

The web application is configured as a PWA, which means:
- It can be installed on mobile devices
- Works offline with cached data
- Provides a native app-like experience
- Fast loading with service workers

To test PWA functionality:
1. Build the web app: `npm run build --workspace=apps/web`
2. Preview the build: `npm run preview --workspace=apps/web`
3. Open Chrome DevTools → Application → Service Workers/Manifest

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by Splitwise
- Built with modern web technologies
- Designed for simplicity and ease of use
