# FounderSignal API Endpoints Inventory

Based on your project structure and frontend code, here's a comprehensive list of API endpoints you need to implement in your Go backend, organized by access level and purpose.

## Public Endpoints

### General

- `GET /api/v1/health` - Health check for API status
  - _Used by_: System monitoring

### Ideas

- `GET /api/v1/ideas` - Get all public ideas
  - _Used by_: Public explore page
- `GET /api/v1/ideas/:id` - Get specific idea details
  - _Used by_: Public idea detail page
- `POST /api/v1/ideas` - Submit a new idea (requires auth middleware)
  - _Used by_: Public idea submission form

### MVP Landing Pages

- `GET /api/v1/ideas/:ideaId/mvps/:mvpId` - Get MVP landing page
  - _Used by_: Public landing page view
- `POST /api/v1/ideas/:ideaId/mvps/:mvpId/signup` - Register audience signup
  - _Used by_: Public landing page signup form

### Signals (Analytics)

- `POST /api/v1/signals` - Record anonymous user interactions
  - _Used by_: Public landing page tracking

## Protected Endpoints (Require Auth)

### Ideas Management

- `PUT /api/v1/ideas/:id` - Update an existing idea
  - _Used by_: Dashboard idea editor
- `DELETE /api/v1/ideas/:id` - Delete an idea
  - _Used by_: Dashboard idea management
- `GET /api/v1/user/ideas` - Get all ideas for current user
  - _Used by_: Dashboard ideas listing

### MVP/Landing Page Management

- `POST /api/v1/ideas/:ideaId/mvps` - Create a new MVP
  - _Used by_: Dashboard MVP creator
- `PUT /api/v1/ideas/:ideaId/mvps/:mvpId` - Update MVP content
  - _Used by_: Dashboard MVP editor

### Analytics

- `GET /api/v1/ideas/:ideaId/analytics` - Get analytics for an idea
  - _Used by_: Dashboard analytics page
- `GET /api/v1/analytics/summary` - Get aggregated analytics
  - _Used by_: Dashboard overview

### Audience Management

- `GET /api/v1/audience` - Get all subscribers
  - _Used by_: Dashboard audience page (`getAudienceMembers`)
- `GET /api/v1/ideas/:ideaId/audience` - Get subscribers for specific idea
  - _Used by_: Dashboard idea details page
- `DELETE /api/v1/audience/:id` - Remove a subscriber
  - _Used by_: Dashboard audience management

### Feedback Management

- `GET /api/v1/ideas/:ideaId/feedback` - Get all feedback
  - _Used by_: Dashboard feedback page
- `POST /api/v1/ideas/:ideaId/feedback` - Add feedback
  - _Used by_: Dashboard feedback entry
- `PUT /api/v1/ideas/:ideaId/feedback/:id` - Update feedback
  - _Used by_: Dashboard feedback moderation
- `DELETE /api/v1/ideas/:ideaId/feedback/:id` - Delete feedback
  - _Used by_: Dashboard feedback moderation

### User Settings

- `GET /api/v1/user/settings` - Get user settings
  - _Used by_: Dashboard settings page (`getUserSettings`)
- `PUT /api/v1/user/settings` - Update user settings
  - _Used by_: Dashboard settings page
- `GET /api/v1/user/profile` - Get user profile
  - _Used by_: Dashboard profile page
- `PUT /api/v1/user/profile` - Update user profile
  - _Used by_: Dashboard profile editor

### Reports & Validation

- `GET /api/v1/reports` - Get all validation reports
  - _Used by_: Dashboard reports section
- `GET /api/v1/reports/:id` - Get specific report
  - _Used by_: Dashboard report details
- `POST /api/v1/reports` - Create validation report
  - _Used by_: Dashboard report generator
- `PUT /api/v1/reports/:id` - Update report
  - _Used by_: Dashboard report editor

## WebSocket Endpoints

Based on your TODO notes about real-time analytics, you'll need these WebSocket endpoints:

1. `ws://your-domain/ws/analytics/:ideaId`

   - _Purpose_: Real-time analytics updates
   - _Used by_: Dashboard analytics page for live view counts, signups
   - _Events_:
     - `view` - Landing page view
     - `signup` - New subscriber
     - `click` - CTA button click

2. `ws://your-domain/ws/notifications`
   - _Purpose_: Real-time user notifications
   - _Used by_: Dashboard notification center
   - _Events_:
     - `new_subscriber` - Someone signed up
     - `new_feedback` - Feedback received
     - `milestone` - Milestone reached (e.g. 100 signups)

## Implementation Notes

1. **Auth with Clerk**:

   - All protected endpoints need the `ClerkAuth` middleware
   - User ID will be available as `c.Get("userId")` in your handlers

2. **Router Structure**:

   - Use route groups for better organization
   - Apply auth middleware selectively based on the endpoint requirements

3. **WebSocket Handler**:

   - Implement using Gin's standard library compatibility
   - Use Redis pub/sub for broadcasting across multiple API instances

4. **Error Handling**:
   - Continue using your `ErrorHandler` middleware

Your Go backend will need to communicate with Clerk's API for certain user management features, but the authentication part is well-handled by your existing middleware.
