# AutoTest Agent 🤖 — Manual QA Observer & Background Test Generator

An autonomous QA testing platform that observes manual application interactions in real time and synthesizes production-ready automated test suites across Playwright, Cypress, Jest RTL, Cucumber BDD, and GitHub Actions CI/CD workflows.

---

## 🌟 Key Features

- **Live Manual QA Event Interceptor**: Automatically records clicks, form inputs, dropdown selections, and navigation with resilient locators (`data-testid`, `getByRole`, `getByLabel`).
- **Assertion Pinpoint Mode**: Click any element on screen to assert visibility, text values, disabled states, or element properties.
- **Multi-Framework Test Generation**:
  - 🎭 **Playwright** (`@playwright/test` TypeScript specs with resilient locators)
  - 🌲 **Cypress** (`cypress/e2e` specs with assertion chains)
  - ⚡ **Jest & React Testing Library** (`userEvent`, `screen`, async `waitFor`)
  - 🥒 **Cucumber / Gherkin BDD** (`Given / When / Then` scenarios)
  - 📋 **QA Manual Test Matrix** (Step-by-step test matrix exportable to CSV)
  - 🚀 **GitHub Actions CI/CD** (`.github/workflows/test-automation.yml`)
- **AI Edge-Case & Boundary Detection**: Uses Gemini to analyze manual test journeys and uncover negative scenarios, SQL/XSS boundary checks, and race conditions.
- **In-Sandbox Live Replayer**: Replay recorded user flows directly in the active browser with visual feedback and logs.
- **Autonomous QA Robot**: Provide a high-level test mission (e.g. *"Search for item, apply promo code SAVE20, and verify discount"*), and the AI agent drives the UI autonomously.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ or v20+ recommended
- **npm** or **bun** or **yarn**

### 2. Installation
```bash
# Clone or extract repository
git clone <your-repo-url>
cd <repo-folder>

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
# Optional: GEMINI_API_KEY for AI-powered autonomous testing & edge cases
GEMINI_API_KEY="your-gemini-api-key-here"

PORT=3000
```
> *Note: If no Gemini API key is provided, the platform automatically switches to its built-in rule-based AST test synthesizer.*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 📂 Project Architecture

```
├── .github/
│   └── workflows/
│       └── test-automation.yml    # Complete CI/CD testing pipeline
├── src/
│   ├── components/
│   │   ├── sandbox/               # Applications under test
│   │   │   ├── StoreApp.tsx       # E-Commerce storefront & cart
│   │   │   ├── SaasSettingsApp.tsx # SaaS team & security settings
│   │   │   └── InvoicePortalApp.tsx # Financial billing & tax calculator
│   │   └── studio/                # QA Studio controls
│   │       ├── TopBar.tsx         # Observer controls, app picker & replay
│   │       ├── StepsTimeline.tsx  # Live captured interaction feed
│   │       ├── CodeGeneratorView.tsx # Playwright, Cypress, Jest, BDD & CI
│   │       ├── EdgeCasesView.tsx  # AI edge-case detection
│   │       ├── AutonomousAgentView.tsx # Autonomous QA Robot
│   │       ├── AssertionModal.tsx # Assertion dropper tool
│   │       └── ReplayerModal.tsx  # In-browser test replayer console
│   ├── context/
│   │   └── TestAgentContext.tsx   # Global test observer state engine
│   ├── types/
│   │   └── testAgent.ts           # Type definitions
│   ├── App.tsx                    # Main split-view workspace
│   ├── main.tsx                   # React root entry
│   └── index.css                  # Tailwind styles
├── server.ts                      # Express API proxy + Vite middleware
├── package.json
└── tsconfig.json
```

---

## 🛠️ Pushing to Your GitHub Repository

If you haven't pushed this code to your GitHub yet, follow these simple steps:

### Option A: From your terminal / command line

1. **Initialize Git (if not already done)**:
   ```bash
   git init
   git branch -M main
   ```

2. **Stage and commit your files**:
   ```bash
   git add .
   git commit -m "feat: initial commit of AutoTest Agent"
   ```

3. **Link to your GitHub repository**:
   Create a new repository on [GitHub](https://github.com/new), then copy its URL and run:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   ```

4. **Push your code**:
   ```bash
   git push -u origin main
   ```

### Option B: Using GitHub Desktop
1. Open GitHub Desktop.
2. Select **File > Add Local Repository...** and choose this project folder.
3. Click **Publish repository** to push it directly to your GitHub account.

---

## 🛡️ License
Apache-2.0
