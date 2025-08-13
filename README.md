# Budget Planner

A full-stack application designed to help users manage their finances, create budgets, track transactions, and collaborate with others in real-time.

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Real-time Communication:** Socket.IO

## Project Structure

```
budget-planner/
├── frontend/
├── backend/
├── database/
├── README.md
├── .gitignore
└── package.json
```

## Setup and Installation

### Prerequisites

- Node.js (v18.x or later)
- npm (v9.x or later)
- PostgreSQL

### 1. Clone the Repository

```bash
git clone <repository-url>
cd budget-planner
```

### 2. Install Dependencies

Install dependencies for both the root, backend, and frontend.

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 3. Setup PostgreSQL Database

1.  Make sure PostgreSQL is running.
2.  Create a new database, for example, `budget_planner`.
3.  Create a `.env` file in the `backend/` directory and configure your database connection. See `backend/.env.example` for the required variables.

    ```env
    DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/budget_planner"
    JWT_SECRET="your_jwt_secret"
    PORT=5001
    ```

### 4. Run Database Migrations & Seeds

The migrations will create the necessary tables, and the seeds will populate the database with initial data (e.g., categories).

```bash
# Make sure you have pg-migrate installed globally or use the root package.json script
npm run db:migrate
npm run db:seed
```

### 5. Start the Application

This command will start both the backend server and the frontend React app concurrently.

```bash
npm run dev
```

- The React app will be running on `http://localhost:3000`.
- The Node.js server will be running on `http://localhost:5000`.