# KALA E-Commerce — Production Deployment Guide

This guide outlines the production deployment architecture, required environment configurations, build commands, and operational security guidelines for the KALA application.

---

## 1. System Architecture

```
       [ Customer Browser ]
                │
                ▼ (HTTPS)
        [ Frontend (SPA) ]
      (e.g., Vercel / Netlify)
                │
                ▼ (HTTPS / CORS Restrictive)
        [ Backend Express API ]
       (e.g., Render / AWS / Railway)
                │
                ▼ (TLS Connection)
        [ MongoDB Atlas DB ]
```

---

## 2. Required Frontend Environment Variables

Configure these variables in your frontend hosting dashboard (e.g., Vercel, Netlify, Cloudflare Pages):

| Variable Name | Description | Example / Safe Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Public HTTPS base URL of the deployed KALA backend API. The client automatically routes requests through this endpoint. | `https://api.yourdomain.com` |

> [!NOTE]
> All `VITE_*` environment variables are bundled into the public client application. Never place private keys, database credentials, or secret keys in frontend environment variables.

---

## 3. Required Backend Environment Variables

Configure these variables in your backend hosting environment (e.g., Render, Railway, AWS ECS, Heroku):

| Variable Name | Required | Description | Example / Placeholder |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | Port on which the Express server listens (default: `5000` or host assigned). | `5000` |
| `MONGODB_URI` | **Required** | Secure MongoDB Atlas connection URI with TLS enabled. | `mongodb+srv://<user>:<password>@cluster.mongodb.net/kala?retryWrites=true&w=majority` |
| `CLIENT_URL` | **Required** | Allowed production origin(s) for CORS. Supports single domain or comma-separated list. | `https://yourdomain.com,https://admin.yourdomain.com` |
| `JWT_SECRET` | **Required** | High-entropy random secret key (min 64 chars recommended) used for HMAC signing of JWT tokens. | `replace_with_a_long_cryptographically_secure_random_string` |
| `JWT_EXPIRES_IN` | Optional | Expiration window for user and admin session tokens (default: `7d`). | `7d` |

---

## 4. Admin Seed Environment Variables

If provisioning or promoting the primary administrator account using the idempotent seed script (`npm run seed:admin`), provide the following backend variables:

| Variable Name | Required for Seeder | Description |
| :--- | :--- | :--- |
| `ADMIN_EMAIL` | Yes | Verified administrative email address. |
| `ADMIN_PASSWORD` | Yes | Strong administrative password (min 6 characters). |
| `ADMIN_FIRST_NAME` | Yes | Administrator first name. |
| `ADMIN_LAST_NAME` | Yes | Administrator last name. |
| `ADMIN_PHONE` | Yes | Valid 10-digit Indian phone number (starts with 6–9). |

---

## 5. Build Commands

### Frontend Build
Execute in the project root:
```bash
npm run build
```
*Compiles TypeScript (`tsc -b`) and bundles static assets into `dist/` using Vite.*

### Backend Build
Execute in the `backend/` directory:
```bash
npm run build
```
*Compiles backend TypeScript into executable JavaScript in `backend/dist/`.*

---

## 6. Production Start Command

To run the production backend service, execute in the `backend/` directory:
```bash
npm start
```
*Runs `node dist/server.js` using Node.js runtime.*

---

## 7. Important Security Guidelines

1. **Zero Secret Exposure**: Never commit `.env` or `.env.*` files containing real secrets into Git.
2. **Public Variable Constraint**: Never prefix secrets with `VITE_`. Treat all frontend assets as public and inspectable.
3. **Restricted CORS**: Always configure `CLIENT_URL` to point exclusively to the production domain(s). Never use `origin: "*"` with authenticated credentials.
4. **Enforce HTTPS**: Serve both frontend and backend strictly over HTTPS. Enable HSTS via Helmet (included by default).
5. **Strong Credentials**: Generate long, cryptographically random values for `JWT_SECRET`. Rotate secrets periodically.
6. **MongoDB Network Security**: Restrict MongoDB Atlas Network Access (IP Access List) to the specific static IPs or VPC peering of the backend host. Never leave Atlas open to `0.0.0.0/0` unless required by dynamic cloud hosts, in which case use strong database user authentication.
7. **Body Size & Rate Limiting**: Production API enforces a 1MB body size limit and per-IP rate limits on authentication, order placement, reviews, and customer inquiries.

---

## 8. Deployment Architecture Recommendation

- **Decoupled Hosting**:
  - Deploy the frontend as a static SPA on a global CDN (e.g., Vercel, Netlify, AWS CloudFront + S3) for maximum edge performance and low latency.
  - Deploy the backend as an independent container or Node.js service (e.g., Render, Railway, AWS App Runner, Fly.io) with automated restarts and environment variable injection.
- **Database**:
  - Use a dedicated MongoDB Atlas cluster with automated backups and replica sets.
