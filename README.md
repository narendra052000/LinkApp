# LinkProject - URL Shortener

A modern, full-stack URL shortener application built with **Next.js (Pages Router)**, **Prisma ORM**, **Postgres**, **Tailwind CSS**, and comprehensive testing.

## Features

- ✅ **Create shortened URLs** with optional custom codes
- ✅ **Track clicks** and view analytics per link
- ✅ **Responsive design** with Tailwind CSS
- ✅ **Server-side redirect** with atomic click increment
- ✅ **Search & filter** links by code or URL
- ✅ **Delete links** with confirmation modal
- ✅ **Copy to clipboard** functionality
- ✅ **Comprehensive API** with detailed validation
- ✅ **Full test coverage** (API + UI)
- ✅ **TypeScript support** with strict type checking
- ✅ **Accessibility-first** semantic HTML

## Tech Stack

- **Framework**: Next.js 14+ (Pages Router)
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: React 18 with Tailwind CSS
- **Styling**: Tailwind CSS + PostCSS
- **Testing**: Jest, Supertest, React Testing Library
- **Linting**: ESLint, Prettier
- **Language**: TypeScript
- **Node**: 18+

## Database Schema

### Links Table

```sql
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_code (code)
);
```

**Prisma Model**:

```typescript
model Link {
  id          String   @id @default(cuid())
  code        String   @unique @db.VarChar(8)
  targetUrl   String   @db.Text
  clicks      Int      @default(0)
  lastClicked DateTime?
  createdAt   DateTime @default(now())

  @@map("links")
  @@index([code])
}
```

## Project Structure

```
LinkProject/
├── pages/
│   ├── _app.tsx                    # Next.js app wrapper
│   ├── _document.tsx               # HTML document
│   ├── index.tsx                   # Dashboard home page
│   ├── [code].tsx                  # Redirect handler (GET /:code)
│   ├── healthz.ts                  # Health check endpoint
│   ├── code/
│   │   └── [code].tsx              # Stats page
│   └── api/
│       ├── links/
│       │   ├── index.ts            # POST /api/links, GET /api/links
│       │   └── [code].ts           # GET /api/links/:code, DELETE /api/links/:code
│       └── healthz.ts              # GET /healthz
├── components/
│   ├── Header.tsx                  # App header
│   ├── Footer.tsx                  # App footer
│   ├── LinkForm.tsx                # Create link form
│   ├── LinkTable.tsx               # Links display table
│   ├── Modal.tsx                   # Confirmation modal
│   ├── Tooltip.tsx                 # Hover tooltips
│   ├── CopyButton.tsx              # Copy-to-clipboard button
│   ├── Spinner.tsx                 # Loading spinner
│   └── Toast.tsx                   # Toast notifications
├── lib/
│   └── prisma.ts                   # Prisma client singleton
├── utils/
│   ├── validation.ts               # URL & code validation
│   ├── time.ts                     # Time formatting utilities
│   ├── api.ts                      # API error handling
│   └── request.ts                  # Client-side fetch helpers
├── styles/
│   └── globals.css                 # Global Tailwind CSS
├── __tests__/
│   ├── api.test.ts                 # API route tests (Supertest)
│   ├── ui.test.tsx                 # UI component tests (RTL)
│   └── utils.test.ts               # Utility function tests
├── prisma/
│   ├── schema.prisma               # Prisma schema
│   └── seed.ts                     # Database seed script
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── jest.config.js
├── jest.setup.ts
├── .eslintrc.json
├── .prettierrc
├── .env.example
├── .gitignore
└── README.md                       # This file
```

## Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### 1. Clone & Install Dependencies

```bash
cd LinkProject
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/linkproject"
NODE_ENV="development"
```

**For local testing with SQLite**:

```env
DATABASE_URL="file:./test.db"
```

### 3. Create Database & Run Migrations

```bash
npx prisma migrate dev --name init
```

This creates the database, runs migrations, and generates the Prisma client.

### 4. (Optional) Seed Database

```bash
npm run seed
```

This adds sample links for development.

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Available Scripts

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build production bundle
npm start               # Start production server
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm test                # Run all tests with coverage
npm run test:watch      # Run tests in watch mode
npm run test:api        # Run only API tests
npm run migrate         # Run Prisma migrations interactively
npm run migrate:test    # Deploy migrations to test database
npm run prisma:generate # Generate Prisma client
npm run seed            # Seed database with sample data
```

## API Endpoints

All API endpoints return JSON and support CORS.

### Create Link

**POST** `/api/links`

Request body:

```json
{
  "target_url": "https://example.com",
  "code": "ABC123" // Optional, auto-generated if omitted
}
```

Response (201):

```json
{
  "id": "clup1234...",
  "code": "ABC123",
  "target_url": "https://example.com",
  "clicks": 0,
  "last_clicked": null,
  "created_at": "2025-11-22T10:00:00Z"
}
```

Errors:

- `400` - Invalid URL or code format
- `409` - Code already exists

### Get All Links

**GET** `/api/links`

Response (200):

```json
[
  {
    "id": "clup1234...",
    "code": "ABC123",
    "target_url": "https://example.com",
    "clicks": 5,
    "last_clicked": "2025-11-22T14:30:00Z",
    "created_at": "2025-11-22T10:00:00Z"
  },
  ...
]
```

### Get Link Stats

**GET** `/api/links/:code`

Response (200):

```json
{
  "id": "clup1234...",
  "code": "ABC123",
  "target_url": "https://example.com",
  "clicks": 5,
  "last_clicked": "2025-11-22T14:30:00Z",
  "created_at": "2025-11-22T10:00:00Z"
}
```

Errors:

- `404` - Link not found

### Delete Link

**DELETE** `/api/links/:code`

Response:

- `204` - Deleted successfully (no content)
- `404` - Link not found

### Redirect (Follow Short Link)

**GET** `/:code`

Behavior:

- Atomically increments `clicks` counter
- Updates `last_clicked` timestamp
- Returns `302` redirect to `target_url`
- Returns `404` if code not found or deleted

Example:

```bash
curl -L http://localhost:3000/ABC123
# Follows redirect to https://example.com
```

### Health Check

**GET** `/healthz`

Response (200):

```json
{
  "ok": true,
  "version": "1.0"
}
```

## Example API Calls

### Create a short link

```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "target_url": "https://github.com/yourusername/yourrepo",
    "code": "GITHUB"
  }'
```

### Get all links

```bash
curl http://localhost:3000/api/links
```

### Get stats for a link

```bash
curl http://localhost:3000/api/links/GITHUB
```

### Delete a link

```bash
curl -X DELETE http://localhost:3000/api/links/GITHUB
```

### Follow a short link

```bash
curl -L http://localhost:3000/GITHUB
```

### Check health

```bash
curl http://localhost:3000/healthz
```

## Validation Rules

### Target URL Validation

- ✅ Must be a valid URL
- ✅ Must have `http://` or `https://` protocol
- ✅ No auto-adding schemes
- ❌ Fails: `example.com`, `ftp://example.com`

### Custom Code Validation

- ✅ 6-8 alphanumeric characters
- ✅ Case-insensitive
- ✅ Pattern: `^[A-Za-z0-9]{6,8}$`
- ❌ Fails: `abc`, `ABC-123`, `specialchars@#`

### Auto-Generated Codes

- 7 random alphanumeric characters
- Collision retry with up to 5 attempts
- Guaranteed uniqueness per database

## Frontend Features

### Dashboard (`/`)

- Create new links with inline validation
- Real-time feedback on code availability
- Search & filter links by code or URL
- Table with columns: Code, URL, Clicks, Last Clicked, Actions
- Copy short URL to clipboard
- Delete with confirmation modal
- Empty state messaging
- Responsive grid layout

### Stats Page (`/code/:code`)

- View full link details
- Display total clicks and analytics
- Show created date and last clicked timestamp
- Copy short URL and original URL
- Back to dashboard link
- 404 handling for missing links

### Accessibility

- Semantic HTML (`<button>`, `<label>`, `<main>`, etc.)
- ARIA attributes (`aria-label`, `aria-live`, `aria-modal`, etc.)
- Keyboard focus styles
- Color contrast compliance
- Reduced motion support

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
npm run test:api        # API tests only
npm run test:watch      # Watch mode
```

### Test Coverage

Tests cover:

**API Tests** (`__tests__/api.test.ts`):

- ✅ POST /api/links - create, duplicate code, invalid validation
- ✅ GET /api/links - list all links
- ✅ GET /api/links/:code - get stats, 404 handling
- ✅ DELETE /api/links/:code - delete, 404 handling
- ✅ GET /:code - redirect, click increment
- ✅ GET /healthz - health check

**UI Tests** (`__tests__/ui.test.tsx`):

- ✅ LinkForm - render, validation, submission
- ✅ LinkTable - display, search, delete modal

**Utility Tests** (`__tests__/utils.test.ts`):

- ✅ URL validation - valid/invalid formats
- ✅ Code validation - valid/invalid codes
- ✅ Random code generation
- ✅ Time formatting

### Test Database

- Tests use a temporary SQLite database
- Auto-cleanup before/after each test suite
- Can be overridden for CI with real Postgres

## Linting & Formatting

### Check Code Quality

```bash
npm run lint
```

### Auto-Format Code

```bash
npm run format
```

### ESLint Rules

- Next.js best practices
- React hooks rules
- TypeScript strict mode
- Warn on unused variables (prefixed with `_`)

## Security Considerations

✅ **Server-side validation** on all inputs
✅ **URL protocol enforcement** (http/https only)
✅ **Code uniqueness** enforced at DB level
✅ **XSS prevention** via React escaping
✅ **SQL injection prevention** via Prisma parameterized queries
✅ **CSRF protection** headers in Next.js
✅ **Atomic operations** for click increment
✅ **Environment variables** for sensitive config

## Performance Optimizations

- ✅ Database indexes on `code` for fast lookups
- ✅ Atomic `UPDATE ... RETURNING` for click tracking
- ✅ Server-side rendering for SEO
- ✅ Lazy component loading with React suspense
- ✅ Tailwind CSS minification in production
- ✅ Next.js automatic code splitting

## Deployment Notes

This project is ready for deployment to:

- **Vercel** (Recommended for Next.js)
- **Railway**, **Render**, **Heroku**
- **Docker** (with custom Dockerfile)
- **Self-hosted** (Node.js + Postgres)

### Pre-Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production Postgres URL
- [ ] Run database migrations
- [ ] Build: `npm run build`
- [ ] Test: `npm test`
- [ ] Set security headers in `next.config.js`

## Troubleshooting

### Database Connection Issues

```bash
# Check Postgres is running
psql -U postgres

# Test connection string
psql "postgresql://user:password@localhost:5432/linkproject"
```

### Migration Issues

```bash
# Reset database (dev only!)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Port Already in Use

```bash
# Run on different port
npm run dev -- -p 3001
```

### Dependency Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Push: `git push origin feature/my-feature`
6. Create a Pull Request

## License

MIT License - feel free to use for personal and commercial projects.

## Support

For issues, feature requests, or questions:

- Open an issue on GitHub
- Check existing documentation
- Review test files for usage examples

---

**Version**: 1.0.0
**Last Updated**: November 22, 2025
