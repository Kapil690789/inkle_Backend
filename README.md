# Inkle Backend Assignment

A robust, scalable social network backend API built with **Node.js, Express, TypeScript, and PostgreSQL**. 

This project implements a role-based social feed system where users can follow others, post content, and view an aggregated "Activity Wall." It includes advanced features like User Blocking, Admin moderation, and an optimized feed query system.

##  Tech Stack
* **Runtime:** Node.js & Express
* **Language:** TypeScript (Strict typing for code quality)
* **Database:** PostgreSQL (Hosted on Supabase)
* **ORM:** Prisma (Schema validation & type-safe queries)
* **Auth:** JWT (JSON Web Tokens) & Bcrypt (Password Hashing)
* **Architecture:** MVC (Model-View-Controller)

##  Features Implemented
* **Auth:** Signup & Login with hashed passwords.
* **RBAC (Permissions):** * **User:** Create posts, like, follow, block.
    * **Admin:** Delete any post.
    * **Owner:** Delete users, promote users to Admin.
* **The "Activity Wall":** A centralized feed showing posts, likes, and follows (e.g., *"Alice followed Bob"*).
* **Blocking System:** If User A blocks User B, User B instantly stops seeing any of User A's activities in their feed.
* **Rate Limiting:** API is protected against spam abuse.

## Key Design Decisions (Thought Process)

### 1. The `ActivityLog` Table
Instead of running complex `JOIN` queries across 5 different tables every time a user requests their feed, I implemented a dedicated `ActivityLog` table. 
* **Why?** This makes the **Read** operation (`GET /feed`) incredibly fast (O(1) complexity relative to table joins). Every time a user Posts, Likes, or Follows, a small log entry is written. The feed simply fetches this chronological log.

### 2. Block Logic Optimization
Blocking is often tricky. I handled this at the database query level using Prisma's `notIn` operator. 
* **Logic:** Before fetching the feed, the system resolves two lists: "Users I blocked" and "Users who blocked me." These IDs are excluded from the feed query entirely, ensuring privacy and data consistency.

### 3. Modular MVC Structure
I avoided putting all logic in `server.ts`. Instead, I separated concerns:
* `controllers/`: Business logic.
* `routes/`: API endpoint definitions.
* `middlewares/`: Auth and Role verification.
This ensures the codebase is maintainable and scalable.

##  How to Run Locally

1.  **Clone the repo**
    ```bash
    git clone <your-repo-link>
    cd inkle-backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root:
    ```env
    DATABASE_URL="postgresql://user:pass@your-supabase-url:5432/postgres"
    JWT_SECRET="your_secret_key"
    ```

4.  **Run Server**
    ```bash
    npx prisma generate
    npx ts-node src/server.ts
    ```

## 📍 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/signup` | Register new user |
| **POST** | `/api/auth/login` | Login & get JWT |
| **GET** | `/api/feed` | **Main Activity Wall** (Smart filtering applied) |
| **POST** | `/api/feed/post` | Create a text post |
| **POST** | `/api/users/follow/:id` | Follow a user |
| **POST** | `/api/users/block/:id` | Block a user |
| **DELETE** | `/api/users/admin/post/:id` | **(Admin)** Delete any post |
| **DELETE** | `/api/users/owner/user/:id` | **(Owner)** Delete a user |