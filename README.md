# OSINT Intelligence Platform

A full-stack Open Source Intelligence (OSINT) platform that aggregates data from multiple vectors, analyzes cross-source corroboration, calculates confidence scores, and determines potential risk exposure.

## 🏗 Architecture

The platform is split into two primary components:

### Frontend (`/client`)

- **Framework**: React via Next.js
- **Styling**: Tailwind CSS for responsive, modern, and aesthetic UI components.
- **Features**: A comprehensive Search Dashboard, Report generation, Semantic UI Data Mapping (for complex API JSON), and Export controls.

### Backend (`/server`)

- **Runtime**: Node.js & Express
- **Database**: MongoDB (via Mongoose)
- **Features**:
  - **Adapter Pattern**: Modular OSINT adapters connect to external APIs (GitHub, Serper, NewsAPI, WhoisXML).
  - **Entity Resolution Phase**: Scans the payload for shared pivots (emails, domains, handles, organization names).
  - **Confidence & Risk Engine**: Calculates a confidence score based on multi-source corroboration and a naive Risk Level (Low/Medium/High) based on security keywords (e.g., breach, vulnerability).
  - **Report Generation**: Supports exporting intelligence payloads into structured PDF, Docx, and Markdown files.

---

## 🔑 API Keys Required

To run the backend adapters, you will need the following API keys. Create a `.env` file in the `/server` directory and add them:

```env
# Database
MONGODB_URI=mongodb+srv://rubeenadhikari2017_db_user:7LA6fVqMiO1MWw4A@cluster0.wk9kexh.mongodb.net/My_Database
PORT=5000

# OSINT Vectors
SERPER_API_KEY=      # For Google Search (Social & Public Footprint)
WHOIS_API_KEY=           # For WhoisXML (Technical Infrastructure)
GITHUB_TOKEN=     # For GitHub API (Code Footprint)
NEWS_API_KEY=        # For NewsAPI (Contextual & Regulatory)
```

---

## 🚀 Setup Instructions

### 1. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with the keys mentioned above.
4. Start the development server:
   ```bash
   npm run dev
   ```
   _The server will run on port 5000 (or the port defined in your `.env`)._

### 2. Frontend Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 Intelligence Engines

### How the Confidence Score Works

The platform calculates an `Overall Confidence` score (max 99%) to determine how reliable the intelligence is. It does this in three phases:

1. **Relevance Scoring (Per Source)**: The engine searches the raw payload for exact token matches, full names, and fuzzy string similarities. A highly relevant payload can score up to 60 points on its own.
2. **Cross-Source Corroboration**: The engine extracts "Pivots" (emails, domains, handles, organization names). If the exact same email or domain is found by _multiple_ adapters (e.g., found on both GitHub and WhoisXML), that specific vector gets a massive corroboration bonus (up to +40 points).
3. **Global Confidence**: The final overall confidence percentage is the average of all individual vector scores, plus a global modifier if "hard" pivots (like emails/domains) were corroborated across the entire ecosystem.

### How the Risk Engine Works

The platform calculates a basic `Risk Level` (Low, Medium, or High) by running the aggregated intelligence payloads through a keyword analyzer.

- If the results contain strings relating to security (such as `breach`, `leak`, `exposed`, `password`, or `vulnerability`), the risk score is heavily penalized.
- Finding `@` symbols (indicating exposed emails) also increases the risk profile.
- A combined score of 60+ triggers a **High** risk warning.

---

## 📑 Exporting Data

You can export completed OSINT reports directly from the Results Dashboard UI. The backend handles dynamic document generation to deliver:

- **PDF**: Print-ready, executive summaries.
- **DOCX**: Editable intelligence drafts.
- **Markdown**: Developer-friendly raw intelligence payloads.
