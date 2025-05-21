## 🧠 FounderSignal — Test Startup Ideas Fast

A real-time micro-validation platform for startup founders to test startup ideas within 72 hours — powered by dynamic MVPs, user feedback, and AI summaries.

---

## 📦 Folder Structure

```
/foundersignal
├── api/
│   ├── .air.toml
│   ├── .env
│   ├── .env.example
│   ├── AUTHOR.txt
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── Makefile
│   ├── cmd/
│   │   ├── config/
│   │   └── server/
│   ├── internal/
│   │   ├── domain/
│   │   ├── dto/
│   │   ├── pkg/
│   │   ├── repository/
│   │   ├── service/
│   │   ├── transport/
│   │   └── websocket/
│   ├── pkg/
│   │   ├── database/
│   │   └── validator/
│   ├── scripts/
│   └── tmp/
│       └── main
├── web/
│   ├── .dockerignore
│   ├── .env.example
│   ├── .env.local
│   ├── Dockerfile
│   ├── README.md
│   ├── components.json
│   ├── eslint.config.mjs
│   ├── middleware.ts
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── explore/
│   │   │   └── submit/
│   │   ├── dashboard/
│   │   │   ├── audience/
│   │   │   ├── ideas/
│   │   │   └── reports/
│   ├── components/
│   │   ├── comments/
│   │   ├── dashboard/ # dashboard related components
│   │   ├── navbar/
│   │   ├── reactions-btns/
│   │   └── ui/ # shadcn ui components
│   ├── contexts/
│   ├── lib/
│   ├── public/
│   └── types/
├── .dockerignore
├── .gitignore
├── docker-compose.yml
├── LICENSE
├── README.md
```

## 🚀 Features

- Idea Cards with elevator pitch and landing CTA
- Auto-generated MVP simulators (fake landing pages)
- Realtime interaction tracking (clicks, time, scroll, heatmaps)
- Audience testing pool with tokenized incentives
- AI-powered summaries of market signal
- Public or private testing modes

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TailwindCSS, Clerk.dev
- **Backend**: Golang (Gin/Fiber), PostgreSQL (NeonDB), Redis
- **Infra**: AWS Lambda, CloudFront, S3
- **Realtime**: WebSockets + Supabase Realtime
- **AI**: OpenAI API (for summarizing feedback)

## 🧪 Getting Started

1. Clone the repo
2. Setup `.env` files for both apps
3. Install dependencies:

   ```bash
   pnpm install # for monorepo
   cd apps/web && pnpm dev
   cd apps/api && go run main.go
   ```

4. Set up PostgreSQL and Redis locally or use hosted services
5. Deploy via Vercel (web) and Railway/Fly.io (api)

---

## ✨ Inspiration

FounderSignal is inspired by the need to quickly iterate on startup ideas, get real feedback, and reduce time spent building products no one wants.

## 📜 License & Attribution

### Code License

This project's **code** is licensed under the [MIT License](LICENSE).

## 🔏 Enforcement

All derivative works must include:

```text
Originally created by Abdul Mateen - https://github.com/JealousGx
Derived from https://github.com/JealousGx/FounderSignal
```
