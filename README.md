**TaskManager API**

A Scalable REST API with Authentication, Role-Based Access, and Task Management

# **Overview**
TaskManager API is a full-stack web application built as a backend internship assignment. It demonstrates secure REST API design, JWT-based authentication using Supabase Auth, role-based access control, CRUD operations, Redis caching, and a React.js frontend.

## **Technology Stack**

|**Layer**|**Technology**|**Purpose**|
| :- | :- | :- |
|Backend|Node.js + Express|REST API server|
|Database|Supabase (PostgreSQL)|Primary data store|
|Authentication|Supabase Auth|User registration, login, JWT|
|Caching|Redis via Upstash|Cache GET task responses|
|Frontend|React.js (Vite)|User interface|
|API Docs|Swagger UI|Interactive API documentation|


# **Project Structure**
taskmanager-api/

`  `src/

`    `config/          Supabase and Redis client setup

`    `controllers/     Request handlers for auth and tasks

`    `middleware/      JWT auth, role checks, input validation

`    `routes/v1/       Versioned API route definitions

`    `services/        Business logic and Redis caching layer

`    `utils/           Shared response helper

`  `server.js          Entry point

`  `swagger.yaml       API documentation

frontend/

`  `src/

`    `api/             Axios instance with token interceptor

`    `context/         Auth context for global state

`    `pages/           Login, Register, Dashboard


# **Getting Started**
## **Prerequisites**
- Node.js v18 or higher
- A Supabase account at supabase.com
- An Upstash account at upstash.com for Redis

## **Backend Setup**
**Step 1 - Clone the repository and install dependencies**

git clone https://github.com/your-username/taskmanager-api.git

cd taskmanager-api

npm install

**Step 2 - Configure environment variables**

Create a .env file in the root of the backend folder with the following values:

PORT=5000

SUPABASE\_URL=your\_supabase\_project\_url

SUPABASE\_ANON\_KEY=your\_supabase\_anon\_key

SUPABASE\_SERVICE\_ROLE\_KEY=your\_supabase\_service\_role\_key

SUPABASE\_JWT\_SECRET=your\_supabase\_jwt\_secret

REDIS\_URL=your\_upstash\_redis\_url

You can find these values in:

- Supabase Dashboard → Project Settings → API
- Upstash Dashboard → Your Database → Connect tab → .env section

**Step 3 - Run the backend server**

npm run dev

The server will start at http://localhost:5000

Swagger API docs will be available at http://localhost:5000/api/docs

## **Frontend Setup**
**Step 1 - Navigate to the frontend folder and install dependencies**

cd frontend

npm install

**Step 2 - Configure environment variables**

Create a .env file inside the frontend folder:

VITE\_API\_URL=http://localhost:5000/api/v1

**Step 3 - Run the frontend**

npm run dev

The React app will start at http://localhost:5173


# **Database Schema**
The database is hosted on Supabase (PostgreSQL). Two tables are used:

## **users table**
Stores user profile information. The id column is linked directly to Supabase Auth, so every registered user automatically has a matching record here.

|**Column**|**Type**|**Description**|
| :- | :- | :- |
|id|UUID|Primary key, synced with Supabase Auth user ID|
|name|VARCHAR|Full name of the user|
|email|VARCHAR|Unique email address|
|password|TEXT|Set to a placeholder; Supabase Auth manages actual password|
|role|VARCHAR|Either 'user' or 'admin'. Defaults to 'user'|
|created\_at|TIMESTAMPTZ|Timestamp when the record was created|

## **tasks table**
Stores tasks belonging to users. Each task is linked to a user via the user\_id foreign key.

|**Column**|**Type**|**Description**|
| :- | :- | :- |
|id|UUID|Primary key, auto-generated|
|title|VARCHAR|Title of the task. Required field|
|description|TEXT|Optional description of the task|
|user\_id|UUID|Foreign key referencing users.id. Deletes cascade|
|created\_at|TIMESTAMPTZ|Timestamp when the task was created|
|updated\_at|TIMESTAMPTZ|Timestamp when the task was last updated|


# **Authentication**
This project uses Supabase Auth to handle user registration and login. Supabase Auth manages password hashing, JWT token generation, and session handling internally. The application does not store raw passwords.

## **Authentication Flow**
**Registration**

When a user registers, the following steps happen in order:

1\. The client sends name, email, and password to POST /api/v1/auth/register

2\. The backend calls supabase.auth.signUp() with the email and password

3\. Supabase Auth creates a user entry internally and returns a user ID

4\. The backend inserts a matching record into the public users table using that same ID

5\. A success response is returned with the user's basic info

**Login**

1\. The client sends email and password to POST /api/v1/auth/login

2\. The backend calls supabase.auth.signInWithPassword()

3\. Supabase verifies the credentials and returns a JWT access token

4\. The backend fetches the user's role from the public users table

5\. The token and user info are returned to the client

**Accessing Protected Routes**

1\. The client includes the JWT token in the Authorization header: Bearer <token>

2\. The authenticate middleware extracts and verifies the token using Supabase Admin client

3\. The user's info is attached to req.user and passed to the next handler

4\. If the token is invalid or missing, a 401 Unauthorized response is returned

## **Role-Based Access**
Each user has a role field that is either 'user' or 'admin'. The authorizeRoles middleware checks this field before granting access to certain routes. For example, an admin can access all tasks in the system while a regular user can only see their own.


# **API Endpoints**
All endpoints are versioned under /api/v1. Protected routes require a valid Bearer token in the Authorization header.

## **Auth Routes**

|**Method**|**Endpoint**|**Access**|**Description**|
| :- | :- | :- | :- |
|POST|/api/v1/auth/register|Public|Register a new user|
|POST|/api/v1/auth/login|Public|Login and receive a JWT token|

## **Task Routes**

|**Method**|**Endpoint**|**Access**|**Description**|
| :- | :- | :- | :- |
|GET|/api/v1/tasks|Protected|Get all tasks for the logged-in user|
|GET|/api/v1/tasks/:id|Protected|Get a single task by ID|
|POST|/api/v1/tasks|Protected|Create a new task|
|PUT|/api/v1/tasks/:id|Protected|Update an existing task|
|DELETE|/api/v1/tasks/:id|Protected|Delete a task|


# **Redis Caching**
Redis caching is implemented on the GET all tasks endpoint using Upstash as the hosted Redis provider.

**How it works**

1\. When a user requests their tasks, the server first checks Redis using the key tasks:<user\_id>

2\. If a cached result exists (cache hit), it is returned immediately without querying the database

3\. If no cache exists (cache miss), the database is queried and the result is stored in Redis for 60 seconds

4\. When a task is created, updated, or deleted, the cache for that user is invalidated immediately


# **Scalability Notes**
This section explains how this project can be scaled to handle more users, more traffic, and larger teams as it grows.

## **1. API Versioning**
All routes are prefixed with /api/v1. This means if the API needs breaking changes in the future, a new version /api/v2 can be released without breaking existing clients. This is a standard industry practice for maintaining backwards compatibility.

## **2. Caching with Redis**
By caching frequently requested data in Redis, the number of database queries is reduced significantly. This means the database is under less load and the API responds faster. As traffic grows, the Redis cache TTL and cache keys can be tuned to handle more complex caching strategies.

## **3. Separation of Concerns**
The project is divided into controllers, services, middleware, and routes. This layered structure makes it straightforward to extract individual parts into separate microservices later. For example, the auth logic and task logic could become independent services communicating over HTTP or a message queue.

## **4. Database Scalability**
Supabase runs on PostgreSQL, which supports read replicas, connection pooling via PgBouncer, and horizontal scaling strategies. For high-traffic scenarios, a read replica can be added to offload SELECT queries from the primary database.

## **5. Load Balancing**
Because the backend is stateless (no session is stored on the server, only JWTs are used), multiple instances of the server can run simultaneously behind a load balancer such as Nginx or an AWS Application Load Balancer. Any instance can handle any request since the token carries all the necessary identity information.

## **6. Environment-Based Configuration**
All sensitive values are stored in .env files and never hardcoded. This makes it easy to deploy the same codebase to different environments such as development, staging, and production without any code changes.


*Built as part of a Backend Developer Intern assignment.*
