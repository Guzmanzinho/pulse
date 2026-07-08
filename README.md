# Pulse

Pulse is a full-stack social network inspired by Twitter/X. It combines a REST API for authentication, publishing, social interactions, and administration with a responsive React client.

## Academic and professional goal

Pulse was developed as an academic project to practise relational database design, backend architecture, API development, authentication, and frontend integration. As a portfolio project, it demonstrates the foundations expected from a junior backend developer: modelling a real domain, protecting resources, implementing business rules, persisting data, and documenting how the system runs.

## Main features

- User registration and login with bcrypt password hashing and JWT authentication.
- Public timeline with active posts, authors, comments, likes, and optional images.
- Authenticated creation, editing, and soft deletion of a user's own posts.
- Comments and like/unlike interactions on posts.
- Follow and unfollow users, plus a feed containing posts from followed accounts.
- Image upload for posts through `multipart/form-data`.
- Role-protected administration area for managing users and posts.
- React routes for landing, authentication, feed, profiles, discovery, and administration.
- Interactive API documentation served with Swagger UI.

## Tech stack

### Backend

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Web framework | Express 4 |
| Database | MySQL |
| ORM | Sequelize 6 |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password security | bcrypt |
| File uploads | Multer |
| API documentation | Swagger UI and `swagger-autogen` |
| Other middleware | CORS, Morgan, cookie-parser, dotenv |

### Frontend

| Area | Technology |
| --- | --- |
| UI | React 18 |
| Routing | React Router 6 |
| Build tool | Vite 5 |
| Styling | Plain CSS with shared design tokens |
| API integration | Browser Fetch API |
| Client persistence | `localStorage` for the JWT, cached user, and local follow state |

## Project structure

```text
pulse/
|-- backend/
|   |-- bin/                 # Express server entry point
|   |-- config/              # Sequelize database connection
|   |-- controllers/         # Authentication, posts, users, and admin logic
|   |-- middlewares/         # JWT, admin authorization, and image uploads
|   |-- models/              # Sequelize models and associations
|   |-- routes/              # REST API route definitions
|   |-- public/              # Express static assets
|   |-- views/               # Default Jade views
|   |-- app.js               # Express application setup
|   |-- swagger.js           # Swagger document generator
|   `-- swagger_output.json  # Generated OpenAPI/Swagger document
|-- frontend/
|   |-- public/              # Public frontend assets
|   |-- src/
|   |   |-- api/             # API client and service adapters
|   |   |-- components/      # Reusable UI components
|   |   |-- contexts/        # Authentication, feed, theme, and toast state
|   |   |-- layouts/         # Application and admin layouts
|   |   |-- pages/           # Route-level screens
|   |   |-- routes/          # Protected route guards
|   |   |-- styles/          # Global styles and design tokens
|   |   `-- utils/           # Shared frontend helpers
|   |-- index.html
|   `-- vite.config.js
|-- bd/
|   |-- entregables_bd/      # Schema, CRUD queries, analysis, and ER documentation
|   `-- diagrama-er.mwb      # MySQL Workbench model
`-- README.md
```

## Data model

| Model / table | Purpose | Main relationships |
| --- | --- | --- |
| `Utilizador` / `utilizador` | Accounts, profile data, roles, and active status | Has many posts, comments, and likes; follows other users through `Seguimento` |
| `Tweet` / `tweet` | Posts of up to 280 characters | Belongs to a user; has comments, likes, and up to one image |
| `Comentario` / `comentario` | Comments of up to 280 characters | Belongs to a post and a user |
| `ImagemTweet` / `imagem_tweet` | Image path and optional alternative text | Belongs to one post |
| `Gosto` / `gosto` | User-to-post like relation | Composite key: `utilizador_id` + `tweet_id` |
| `Seguimento` / `seguimento` | Follower-to-followed user relation | Composite key: `seguidor_id` + `seguido_id` |

The canonical SQL creation script is available at [`bd/entregables_bd/02_script_criacao_bd.sql`](bd/entregables_bd/02_script_criacao_bd.sql). It defines the foreign keys, constraints, and indexes used by the project.

## Environment variables

Create local environment files from the committed examples. Do not commit real secrets.

### Backend — `backend/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | HTTP port. Defaults to `3000`. |
| `CLIENT_URL` | No | Allowed frontend origin for CORS. Defaults to `http://localhost:5173`; accepts a comma-separated list. |
| `DB_NAME` | Yes | MySQL database name. |
| `DB_USER` | Yes | MySQL user. |
| `DB_PASSWORD` | Yes | MySQL password. |
| `DB_DIALECT` | Yes | Sequelize dialect; use `mysql`. |
| `DB_HOST` | Yes | MySQL server hostname. |
| `DB_PORT` | Yes | MySQL server port, normally `3306`. |
| `DB_SSL` | No | Set to `true` to enable MySQL SSL, or `false`/unset for a plain local connection. |
| `DB_SSL_CA_PATH` | Only when `DB_SSL=true` | Path to the CA certificate used for SSL database connections. |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs. Use a long random value outside development. |

### Frontend — `frontend/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Recommended | Backend base URL. The client falls back to `http://localhost:3000`. |

Copy the examples with PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Or with a POSIX-compatible shell:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Run locally

### Prerequisites

- Node.js 18 or newer and npm.
- A MySQL instance. Hosted databases such as Aiven can use SSL with a CA certificate; local development can run without SSL.
- MySQL Workbench or the MySQL CLI to create the database schema.

### 1. Create the database

Run [`bd/entregables_bd/02_script_criacao_bd.sql`](bd/entregables_bd/02_script_criacao_bd.sql) against the target MySQL server. For example, from a shell with the MySQL client installed:

```bash
mysql -u root -p < bd/entregables_bd/02_script_criacao_bd.sql
```

Then update `backend/.env` with the connection values. Set `DB_SSL=true` and provide `DB_SSL_CA_PATH` when your database requires a CA certificate, such as Aiven. The application does not currently run Sequelize migrations or seed data automatically.

### 2. Run the backend

```bash
cd backend
npm ci
npm start
```

The API listens on [http://localhost:3000](http://localhost:3000) unless `PORT` is changed.

Available backend script:

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Express HTTP server. |
| `npm test` | Run the backend Jest API tests. |

### 3. Run the frontend

In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Vite serves the application at [http://localhost:5173](http://localhost:5173).

Available frontend scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build in `frontend/dist`. |
| `npm run preview` | Preview the production build locally. |

## API documentation

With the backend running, Swagger UI is available at:

- [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

The unauthenticated healthcheck is available at:

- [http://localhost:3000/health](http://localhost:3000/health)

The UI reads the committed `backend/swagger_output.json`. To regenerate it after future API changes, run the following command from `backend/`:

```bash
node swagger.js
```

Main API groups:

- `/api/auth` — registration, login, logout, and token-protected profile check.
- `/api/tweets` — public listing and authenticated post, comment, and like operations.
- `/api/utilizadores` — follow, unfollow, and followed-users feed.
- `/api/admin` — admin-only user and post management.

Protected endpoints expect this header:

```http
Authorization: Bearer <token>
```

## Current limitations

- Database setup is manual: there are no Sequelize migrations, seed scripts, or demo accounts.
- Automated tests are currently limited to basic backend API coverage; lint and formatting scripts are not configured.
- `npm audit` currently reports known vulnerabilities in the existing dependency trees, including high/critical findings in the backend; dependencies should be reviewed before production use.
- The backend has no public user-list or user-profile endpoint. The frontend derives some discovery/profile data from public posts, and follow counts/state are partially cached in `localStorage`.
- Uploaded images are stored on the backend's local filesystem; uploads are limited to image MIME types and 2 MB.
- Logout clears client state but does not invalidate an issued JWT on the server.
- Swagger is generated from the current route files, but request/response schemas and production server metadata are not fully specified.

## Future improvements

- Expand automated unit, integration, and API test coverage, plus CI checks.
- Review and update dependencies, validating compatibility as security findings are resolved.
- Introduce versioned migrations and safe development seed data.
- Add public profile, user search, follower/following counts, and richer feed endpoints.
- Move uploads to durable object storage and add deeper file validation beyond MIME type checks.
- Add centralized request validation with a library such as Joi, Zod, or express-validator, plus rate limiting and token revocation or refresh-token support.
- Expand the OpenAPI specification with schemas, examples, security definitions, and environment-specific server URLs.
- Add containerized local development and deployment documentation.

## What I learned

Building Pulse helped me practise how to:

- translate a social-network domain into a normalized relational schema with constraints and indexes;
- structure an Express API into routes, controllers, middleware, and Sequelize models;
- implement authentication and role-based authorization while keeping password hashes out of API responses;
- enforce ownership and business rules for posts, follows, comments, and likes;
- connect a React interface to a real REST API and adapt backend data to frontend view models;
- handle multipart image uploads and serve uploaded media;
- document configuration, known trade-offs, and a reproducible development workflow.
