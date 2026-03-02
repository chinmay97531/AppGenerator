# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all Vitest tests
npx vitest run src/path/to/__tests__/file.test.tsx  # Run a single test file
npm run db:reset     # Force reset and re-run all migrations
```

**Environment:** Copy `.env` and set `ANTHROPIC_API_KEY` (optional — falls back to a mock provider that returns static code).

## Architecture

UIGen is a Next.js 15 App Router application where users describe React components in a chat interface and receive AI-generated code with live preview.

### Data Flow

1. User types a prompt → `/api/chat` route (streams via Vercel AI SDK)
2. Claude responds using two tools: `str_replace_editor` (create/modify files) and `file_manager` (rename/delete)
3. Tool calls update the **virtual file system** (in-memory, never writes to disk)
4. The preview iframe regenerates — Babel Standalone compiles JSX in the browser using an import map over the virtual FS
5. For authenticated users, the virtual FS and chat history are persisted as JSON strings in the SQLite `Project` table

### Key Files

| File | Purpose |
|------|---------|
| `src/app/api/chat/route.ts` | AI streaming endpoint; registers tools and calls Claude |
| `src/lib/file-system.ts` | Virtual file system implementation (create, read, update, delete, serialize) |
| `src/lib/provider.ts` | AI provider abstraction; returns real Anthropic client or `MockLanguageModel` |
| `src/lib/prompts/generation.tsx` | System prompt for Claude (component generation instructions) |
| `src/lib/tools/` | Tool definitions (`str-replace.ts`, `file-manager.ts`) passed to the AI |
| `src/lib/transform/jsx-transformer.ts` | Converts virtual FS files to a full HTML document (with Babel + import map) for the iframe |
| `src/lib/contexts/file-system-context.tsx` | React context wrapping the virtual FS; consumed by editor and preview |
| `src/lib/contexts/chat-context.tsx` | React context for chat state; bridges Vercel AI SDK `useChat` with the file system |
| `src/app/main-content.tsx` | Root layout with resizable panels: Chat | Editor | Preview |
| `src/middleware.ts` | JWT session verification for protected routes |
| `src/actions/` | Server actions for auth (sign up/in/out) and project CRUD |

### Database

SQLite via Prisma. Schema has two models: `User` (email/password auth) and `Project` (stores `messages` and `data` as JSON strings). Generated client lives in `src/generated/prisma/`.

### Authentication

JWT tokens signed with `JWT_SECRET`, stored in `httpOnly` cookies. The `jose` library handles signing/verification. Auth logic is in `src/lib/auth.ts` (marked `server-only`).

### AI Provider

`src/lib/provider.ts` checks for `ANTHROPIC_API_KEY`. With a key it uses `claude-haiku-4-5`. Without a key it returns a `MockLanguageModel` that streams a hardcoded response — useful for UI development without API costs.

### Testing

Tests use Vitest + React Testing Library with jsdom. Test files live in `__tests__/` directories co-located with the code they test (e.g., `src/components/chat/__tests__/`, `src/lib/__tests__/`).
