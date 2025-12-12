# IntelliLedger - AI Financial Autopilot

IntelliLedger is an autonomous bookkeeping and tax compliance platform designed for modern businesses. It automates data ingestion, categorization, invoicing, and reporting.

## 🚀 Features

*   **Financial Dashboard:** Real-time P&L, Cash Flow, and Burn Rate.
*   **AI Bookkeeping:** Automated transaction categorization using Gemini AI.
*   **Multi-Jurisdiction Tax:** Estimates for US (IRS), UK (HMRC), and more.
*   **Invoicing:** Recurring templates and PDF generation.
*   **Executive Briefs:** AI-generated monthly commentary and KPI analysis.
*   **Bank Integration:** Mock integration layer for Plaid, Stripe, and QuickBooks.

## 🛠️ Deployment Guide (How to go Live)

To launch this application on the web, follow these steps:

### Phase 1: Push to GitHub
1.  **Download** the code from this editor.
2.  Create a new repository on [GitHub.com](https://github.com/new) (Name it `intelliledger`).
3.  Upload the files to your new repository.

### Phase 2: Deploy to Vercel
1.  Go to [Vercel.com](https://vercel.com) and log in.
2.  Click **"Add New..."** -> **"Project"**.
3.  Select **"Continue with GitHub"**.
4.  Select the `intelliledger` repository you just created.
5.  **Framework Preset:** Vercel should auto-detect "Create React App" or "Vite". If not, select **Vite**.
6.  **Environment Variables:** You will need to add your API Key here eventually (e.g., `API_KEY` for Gemini).
7.  Click **Deploy**.

### Phase 3: Connect Domain
1.  Once deployed, go to your Vercel Project Dashboard.
2.  Click **Settings** -> **Domains**.
3.  Enter `getintelliledger.com`.
4.  Follow the instructions to update your DNS records at your domain registrar.

## 🔒 Security

*   **SOC2 Compliance:** The application includes audit logging and RBAC structures.
*   **Encryption:** Data at rest logic is simulated in the `Security` tab.

## 📄 License

Proprietary software for IntelliLedger Inc.