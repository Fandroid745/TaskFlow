# TaskFlow

TaskFlow is an Android-first task management application built with React Native CLI and TypeScript. It supports user authentication, task management, priorities, due dates, filtering, and persistent storage.

## Features

- User registration and login
- Create tasks with a title, description, due date and time, and priority
- Mark tasks as completed
- Delete tasks
- Filter tasks by status and priority
- Persist local task and theme data with AsyncStorage
- Store authenticated tasks per user in MongoDB
- JWT-based sessions
- Password hashing with bcryptjs
- REST API backend
- Responsive Android-first UI

The app displays two demo tasks when there is no authenticated session and no cached task data. Once a user is authenticated, task CRUD operations use the API. AsyncStorage retains cached tasks and settings for offline fallback.

## Tech Stack

### Mobile

- React Native CLI
- TypeScript
- React Context API
- AsyncStorage
- React Navigation
- React Native components

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT
- bcryptjs
- dotenv

## Architecture

- Context-based shared state management in `src/context/AppContext.tsx`
- Typed domain models in `src/types/`
- REST client and persistence adapters in `src/services/`
- User-scoped CRUD operations enforced by JWT middleware and MongoDB queries
- Separate mobile and API packages with their own `package.json` files

## Project Structure

```text
TaskFlow/
├── android/
├── ios/
├── src/
│   ├── context/
│   ├── screens/
│   ├── services/
│   ├── theme/
│   └── types/
├── server/
│   ├── src/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── index.ts
│   │   └── models.ts
│   ├── .env.example
│   └── package.json
├── App.tsx
└── package.json
```

## Running the Project

### Prerequisites

- Node.js 22.11 or newer
- Android Studio, an Android SDK, and an Android emulator or USB-connected device
- MongoDB running locally or a reachable MongoDB deployment
- React Native environment dependencies from the [official setup guide](https://reactnative.dev/docs/set-up-your-environment)

### Mobile App

From the repository root:

```bash
npm install
npm start
```

In another terminal, build and install the Android app:

```bash
npm run android
```

Run the mobile tests or linter with:

```bash
npm test
npm run lint
```

### Backend

Create the server environment file and install the API dependencies:

```bash
cd server
cp .env.example .env
npm install
```

The default `.env.example` configuration expects MongoDB at `mongodb://127.0.0.1:27017/taskflow` and starts the API on port `4000`. Set a long, random `JWT_SECRET` in `server/.env` before using the API outside local development.

Start the development server:

```bash
npm run dev
```

The API health endpoint is available at `http://localhost:4000/health`.

### Configure the Mobile API URL

Set `API_BASE_URL` in `src/services/api.ts` to an address reachable from the device:

- Android emulator: `http://10.0.2.2:4000`
- Physical Android device: `http://<your-computer-LAN-IP>:4000`

The current source value is a machine-specific LAN address, so it may need to be changed after cloning. For a physical device, keep the phone and computer on the same network and allow port `4000` through the computer's firewall if necessary.

## Build APK

From the repository root:

```bash
cd android
./gradlew assembleDebug
```

The debug APK is generated under `android/app/build/outputs/apk/debug/`.

## Reset Demo Data

Uninstall the app from the emulator, or clear its storage from Android Settings. The next launch shows the demo tasks when there is no authenticated session or cached task data. Authenticated tasks remain in MongoDB until they are deleted through the app or database.
