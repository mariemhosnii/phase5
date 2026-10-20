# TaskFlow: Task Management Application

A full-stack task management web application built with the MERN stack (MongoDB, Express.js, React, Node.js) for my GoMyCode Lab Phase project.

## Features
- User registration and login with JWT authentication
- Private task lists with create, edit, complete, and delete actions
- Status filtering, task search, and sorting by creation date, deadline, or title
- Task title, description, deadline, priority, and status
- Responsive React interface

## Tech Stack
React, Node.js, Express.js, MongoDB (Mongoose)

## Run the app
```bash
npm install --prefix server
npm install --prefix client
```

Copy `server/.env.example` to `server/.env` and set `MONGO_URI` and a long random `JWT_SECRET`.

Start the whole app from the project root:
```bash
npm start
```

Open `http://localhost:5000` for the UI and API on the same origin. For frontend development with Vite hot reload, use `npm run client` in another terminal while the backend is running.

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create an account |
| POST | /api/auth/login | Log in and receive a JWT |
| GET | /api/tasks | List the signed-in user's tasks |
| POST | /api/tasks | Create a task for the signed-in user |
| GET | /api/tasks/:id | Get one of the signed-in user's tasks |
| PUT | /api/tasks/:id | Update one of the signed-in user's tasks |
| DELETE | /api/tasks/:id | Delete one of the signed-in user's tasks |

All `/api/tasks` endpoints require `Authorization: Bearer <token>`. The API derives task ownership from the verified token; clients cannot set the owner.

## Project Structure
```
client/   React frontend
server/   Express API + MongoDB
  config/        database connection
  middleware/    JWT authentication
  models/        user and task schemas
  controllers/   request logic
  routes/        API routes
  server.js      entry point
```

## Status
In progress: authentication and user-owned tasks implemented
