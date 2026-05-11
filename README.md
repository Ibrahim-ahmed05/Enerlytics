# Enerlytics ⚡
### AI-Powered Electricity Forecasting & Bill Optimization

Enerlytics is a smart electricity management platform designed to help K-Electric consumers predict their monthly consumption and optimize their usage to stay within lower billing slabs. It combines deep learning forecasting models with a rule-based recommendation engine to provide actionable insights.

---

## 🌟 Key Features

### 1. **Ensemble AI Forecasting**
Our system uses a sophisticated ensemble of two deep learning models to predict next month's consumption:
*   **LSTM (Long Short-Term Memory):** Captures seasonal trends and historical patterns.
*   **TFT (Temporal Fusion Transformer):** Handles complex time-series data with attention mechanisms for high precision.
*   **Synthetic Data Generation:** Generates realistic hourly usage data based on Karachi's weather patterns to train models effectively.

### 2. **Smart Recommendation Engine**
A rule-based intelligence layer that triggers when you are projected to cross a **K-Electric Slab Boundary** (e.g., 200 or 300 units).
*   **Slab Awareness:** Calculates exact unit reductions needed to stay in a lower price bracket.
*   **Peak-Hour Shifting:** Identifies opportunities to shift high-load appliances (like washing machines and irons) away from peak hours (5 PM – 11 PM).
*   **Appliance Wattage Analysis:** Provides prioritized tips based on standard wattage profiles for common Pakistani household appliances.

### 3. **Automated Bill Scraping**
*   **Playwright Scraper:** Automatically fetches duplicate bills from the K-Electric portal.
*   **PDF Extractor:** Parses billing data directly from PDFs to build a persistent historical database in **Supabase**.

---

## 🛠️ Tech Stack

*   **Frontend:** [Next.js](https://nextjs.org/) (React), Tailwind CSS, Framer Motion, Lucide Icons.
*   **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python).
*   **Database & Auth:** [Supabase](https://supabase.com/).
*   **Machine Learning:** TensorFlow, PyTorch, PyTorch Forecasting.
*   **Automation:** Playwright (Node.js).

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)
*   Supabase Account

### 2. Installation

**Clone the repository:**
```bash
git clone https://github.com/Ibrahim-ahmed05/Enerlytics.git
cd Enerlytics


npm install
cp .env.example .env
# Fill in your Supabase URL and Anon Key in .env
npm run dev

cd backend
pip install -r requirements.txt
# Ensure ML models (.h5 and .ckpt) are in the backend directory
uvicorn main:app --reload
