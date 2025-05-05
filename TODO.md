# TODO.md - FounderSignal Project

## 📁 Project Setup

1. **Initialize Monorepo**

   - Use TurboRepo or Nx to manage both frontend and backend
   - Folder structure:

     ```
     /foundersignal
     update when done.
     ```

2. **Set Up Frontend**

   - Init Next.js 15 project with App Router
   - Configure TailwindCSS, ESLint, Prettier
   - Add shadcn/ui for components
   - Setup Clerk.dev or NextAuth.js

3. **Set Up Backend (API)**

   - Init Go project using Gin or Fiber
   - Add endpoints for idea submission, analytics tracking, and auth
   - Connect to PostgreSQL (NeonDB) and Redis
   - Setup WebSocket for real-time tracking

4. **Setup Infrastructure (AWS)**

   - Use Serverless Framework or Terraform
   - Provision:

     - Lambda for async tasks (e.g., email notifications, OpenAI summary)
     - S3 for media/landing assets
     - CloudFront for CDN
     - RDS for PostgreSQL (or use NeonDB)
     - Redis (Elasticache or hosted Redis)

5. **Database Schema Design**

   - Tables:

     - `users`: id, name, email, auth_provider
     - `ideas`: id, user_id, title, description, created_at, public/private
     - `mvp_simulators`: id, idea_id, html_content, cta_labels
     - `signals`: id, mvp_id, user_id, event_type, metadata (JSONB)
     - `feedback`: id, user_id, idea_id, comment, rating, timestamp
     - `tokens`: id, user_id, balance

6. **Frontend Development**

   - Pages:

     - `/submit`: Submit an idea (title, pitch, CTA text)
     - `/ideas`: Publicly viewable MVPs
     - `/dashboard`: Founder dashboard with analytics & feedback
     - `/feedback`: Provide feedback (interactive form)

   - Components:

     - MVP simulator renderer
     - Heatmap overlay
     - Realtime interaction counter
     - Token badge

7. **Realtime Analytics**

   - Use Golang WebSocket server to push interaction events
   - Redis pub/sub or Supabase Realtime to sync across clients
   - Frontend hooks for real-time event feed

8. **AI Summarization**

   - Async job via AWS Lambda
   - Use OpenAI API (GPT-4) to summarize:

     - Overall market interest
     - CTA performance
     - Common feedback themes

9. **Token Reward System**

   - Mint virtual tokens when users give feedback or test MVPs
   - Dashboard to track earned/spent tokens
   - Potential monetization layer

10. **Testing & Deployment**

    - CI/CD with GitHub Actions
    - Vercel for frontend
    - Fly.io or Railway for Golang backend (or ECS Fargate)
    - End-to-end tests (Playwright/Cypress)
