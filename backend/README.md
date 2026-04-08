# WorkoutTracker Backend

Custom Node/Express backend for email/password auth and PostgreSQL-backed cloud sync.

## What It Stores

This backend is designed around the current mobile store shape. Instead of forcing a relational redesign immediately, it stores a per-user JSON sync snapshot in PostgreSQL.

That means the app can sync:
- XP totals
- exercise mastery
- muscle group XP
- calendar logs
- custom exercises
- workout history

## Endpoints

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /sync/state`
- `PUT /sync/state`

## Setup

1. Copy `.env.example` to `.env`
2. Create a PostgreSQL database
3. Run the SQL in `src/db/schema.sql`
4. Install dependencies
5. Start the server

## Example `.env`

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/workouttracker
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:8081
```

## Install + Run

```bash
cd backend
npm install
npm run dev
```

## Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "you@example.com",
  "password": "supersecure123"
}
```

## Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "you@example.com",
  "password": "supersecure123"
}
```

## Save App State

```http
PUT /sync/state
Authorization: Bearer <token>
Content-Type: application/json

{
  "stateVersion": 1,
  "state": {
    "totalXP": 1200,
    "level": 5
  }
}
```

## Load App State

```http
GET /sync/state
Authorization: Bearer <token>
```

## Next App-Side Step

The mobile app should:
1. Add sign-in / register screens
2. Store the auth token securely
3. Download sync state after login
4. Push sync state after local changes

This backend is ready for that app integration work.
