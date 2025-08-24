## 🧠 FounderSignal — Test Startup Ideas Fast

> **⚠️ NOTE:** FounderSignal website is no longer functional. The backend was deployed on a paid platform on free tier and since it's already expired and I could not get enough active users, I decided to archive the project.

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
- **Backend**: Golang (Gin), PostgreSQL, (To be implemented later)
- **Realtime**: WebSockets
- **AI**: OpenAI API (for summarizing feedback) (To be implemented later)

## 🧪 Getting Started

1. Clone the repo
2. Setup `.env` files for both apps

- For the web app, navigate to the `web` directory:
  ```bash
  cd web
  cp .env.example .env.local
  ```
  Then, fill in the necessary environment variables in `.env.local`.
  - For the API, navigate to the `api` directory:
    ```bash
    cd api
    cp .env.example .env
    ```
    Then, fill in the necessary environment variables in `.env`.

3. Install dependencies:
   - For the web app (from the `web` directory):
   ```bash
   pnpm install
   pnpm dev
   ```

- For the API (from the `api` directory):
  ```bash
  # Ensure you have Go installed
  go run cmd/server/main.go
  # Or, if you prefer using Air for live reloading (ensure Air is installed):
  # air
  ```

---

## ✨ Inspiration

FounderSignal is inspired by the need to quickly iterate on startup ideas, get real feedback, and reduce time spent building products no one wants.

## 📜 License & Attribution

### Code License

This project's **code** is licensed under the [MIT License](LICENSE).
