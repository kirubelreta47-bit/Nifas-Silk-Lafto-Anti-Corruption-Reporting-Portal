# Nifas Silk-Lafto Anti-Corruption Reporting Portal
## የንፋስ ስልክ ላፍቶ ክፍለ ከተማ አስተዳደር የሥነ-ምግባር እና የፀረ-ሙስና መጠቆሚያ ፖርታል

Official citizen corruption reporting and administrative case management platform for **Nifas Silk-Lafto Sub-City Administration, Addis Ababa, Ethiopia**.

---

## 🏛️ Architecture Overview

The project is structured as a production-ready, decoupled full-stack workspace:

```text
nifas-silk-lafto-anti-corruption-reporting-portal/
├── frontend/                     # Client application (Target: Vercel)
│   ├── src/
│   │   ├── components/           # UI Components (Header, Footer, AudioRecorder, StatusBadge, etc.)
│   │   ├── context/              # LanguageContext (Amharic & English)
│   │   ├── i18n/                 # Complete bilingual translation dictionaries
│   │   ├── pages/                # Public whistleblower form & Admin suite
│   │   ├── services/             # apiClient.ts & reportService.ts
│   │   └── types/                # TypeScript interfaces
│   ├── public/                   # Static public assets
│   ├── index.html                # HTML entry point with Ethiopic fonts
│   ├── vite.config.ts            # Vite bundler configuration
│   ├── tsconfig.json             # Frontend TypeScript configuration
│   ├── package.json              # Frontend dependencies (React 19, Tailwind CSS v4, Lucide, Recharts)
│   └── .env.example              # Frontend environment template
│
├── backend/                      # API server (Target: Render)
│   ├── src/
│   │   ├── config/               # Environment & CORS configuration
│   │   ├── controllers/          # Request handlers (auth, reports, upload)
│   │   ├── db/                   # Neon PostgreSQL connection pool, schema.sql, seed data
│   │   ├── middleware/           # CORS, error handling, file upload guards
│   │   ├── routes/               # Express API routes (/health, /api/auth, /api/reports, /api/upload)
│   │   ├── types/                # Backend data models
│   │   ├── tests/                # Node.js native test runner test suite
│   │   ├── server.ts             # Express application setup
│   │   └── index.ts              # Server startup & database initialization
│   ├── render.yaml               # Render Blueprint configuration
│   ├── tsconfig.json             # Backend TypeScript configuration
│   ├── package.json              # Backend dependencies (Express, pg, multer, cors, dotenv)
│   └── .env.example              # Backend environment template
│
├── package.json                  # Root workspace scripts
├── .gitignore                    # Monorepo git ignore rules
└── README.md                     # Platform documentation
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
* **Node.js**: v18+ (tested on Node v25)
* **npm**: v9+

### 1. Install Dependencies
```bash
# In the project root, install all workspace dependencies:
npm install
```

### 2. Run Both Services Concurrently
```bash
# Terminal 1: Run Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2: Run Frontend (Port 3000)
cd frontend
npm run dev
```

* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **Backend API Health Check**: [http://localhost:5000/health](http://localhost:5000/health)
* **Admin Suite**: [http://localhost:3000/admin](http://localhost:3000/admin)
  * Default Email: `admin@nsl.gov.et`
  * Dev Admin Password: `change-me-in-production-123!` (or value configured in `INITIAL_ADMIN_PASSWORD`)

---

## 🧪 Testing & Verification

```bash
# Run backend tests:
cd backend
npm test

# Type-check frontend:
cd frontend
npm run lint

# Type-check backend:
cd backend
npm run lint

# Build frontend production bundle:
cd frontend
npm run build

# Build backend:
cd backend
npm run build
```

---

## 🌐 Production Deployment Architecture

* **Frontend**: Deployed to [Vercel](https://vercel.com) (Root directory: `frontend`)
* **Backend**: Deployed to [Render](https://render.com) (Web Service, Root directory: `backend`)
* **Database**: Hosted on [Neon](https://neon.tech) (Serverless PostgreSQL with SSL)
* **Storage Modes**:
  * **Local Filesystem (`STORAGE_MODE=local`)**: Default for initial presentation deployment. Stores files in a configurable directory (`UPLOAD_DIR`). Does not require Cloudflare R2 credentials.
    > ⚠️ **Important Ephemeral Storage Notice for Render**: Render's default disk is temporary. Uploaded files will disappear whenever the server restarts, sleeps, or is redeployed. Do not rely on local storage for long-term production file retention.
  * **Cloudflare R2 (`STORAGE_MODE=r2`)**: For permanent persistent cloud object storage. Neon stores metadata references while raw evidence files are stored in a private R2 bucket.
