# TaskFlow API

Node.js, Express, TypeScript, and MongoDB API for authentication and task storage.

## Run locally

1. Install MongoDB locally or create a MongoDB Atlas database.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a strong `JWT_SECRET`.
3. Run:

```bash
npm install
npm run dev
```

The API runs on `http://localhost:4000`. Start Metro and the API before registering from the Android app. The emulator uses `10.0.2.2` to reach the host machine; a physical phone needs the host computer's LAN IP in `src/services/api.ts`.

## Endpoints

- `POST /auth/register` with `{ email, password }`
- `POST /auth/login` with `{ email, password }`
- `GET /tasks` with `Authorization: Bearer <token>`
- `POST /tasks` with `Authorization: Bearer <token>`
- `PATCH /tasks/:id` with `Authorization: Bearer <token>`
- `DELETE /tasks/:id` with `Authorization: Bearer <token>`

Passwords are hashed with bcrypt and tasks are always scoped to the authenticated user.
