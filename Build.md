# MERN Docker — Dev & Production Setup

## Quick start

```bash
# 1. Copy the env template and fill in your values
cp .env.example .env.dev

# 2. Start the development stack (hot-reload for both frontend & backend)
make dev-build
```

## Directory layout

```
mern-docker/
├── backend/
│   ├── Dockerfile              # Multi-stage: deps → dev → production
│   ├── .dockerignore
│   └── src/
│       ├── config/env.js       # ← validated env parsing (read this!)
│       └── index.js
├── frontend/
│   ├── Dockerfile              # Multi-stage: deps → dev → builder → production
│   ├── .dockerignore
│   └── nginx.conf              # SPA fallback + security headers + gzip
├── docker-compose.dev.yml      # Bind mounts, HMR, exposed Mongo port
├── docker-compose.prod.yml     # Sealed images, resource limits, healthchecks
├── .env.example                # ← commit this; never commit .env.dev
├── .gitignore
└── Makefile                    # make help
```

## Environment variables

| Variable            | Required | Description                                    |
|---------------------|----------|------------------------------------------------|
| `MONGO_ROOT_USER`   | dev only | Mongo init root user                           |
| `MONGO_ROOT_PASSWORD`| dev only| Mongo init root password                       |
| `MONGO_DB_NAME`     | dev only | Database name for init                         |
| `MONGO_URI`         | ✅       | Full connection string (injected in prod)       |
| `JWT_SECRET`        | ✅       | 64-byte random hex — generate with `openssl rand -hex 64` |
| `ALLOWED_ORIGINS`   |          | Comma-separated CORS origins (prod)            |
| `VITE_API_URL`      |          | Public API base URL baked into the JS bundle   |

## Make commands

```
make help          # list all commands
make dev           # start dev stack
make dev-build     # rebuild and start dev
make prod          # start prod (detached)
make prod-build    # rebuild and start prod
make logs          # tail dev logs
make shell-backend # sh into backend container
make clean         # prune stopped containers
```

## Industry practices applied

- **Multi-stage builds** — separate stages for deps / dev / builder / production; final image contains no devDependencies or build tooling.
- **Non-root user** — all runtime stages run as `appuser`, not root.
- **Layer cache** — `package.json` + `package-lock.json` copied before source so `npm ci` is only re-run when deps change.
- **Safe env parsing** — `src/config/env.js` validates required vars at startup and crashes fast with a clear message if any are missing.
- **Secrets never in images** — `.env` files are in `.dockerignore`; production vars are injected at runtime by the orchestrator.
- **`VITE_` public vars** — only public API URLs go in `VITE_` vars; they are baked into the bundle and visible in the browser.
- **`.dockerignore`** — prevents `node_modules`, `.env`, tests, and editor files from bloating the build context.
- **Healthchecks** — all three services declare healthchecks; `depends_on: condition: service_healthy` prevents premature startup.
- **Graceful shutdown** — backend listens for `SIGTERM`/`SIGINT` and closes the Mongo connection cleanly.
- **Resource limits** — production compose sets memory caps to protect the host.
- **Nginx** — serves the React SPA with security headers, aggressive asset caching (Vite content-hashes), and gzip.
