
# 🚀 TokenWise — Real-Time Wallet Intelligence on Solana

TokenWise is a real-time wallet monitoring and transaction analysis dashboard for the Solana blockchain. It tracks top token holders, fetches their latest transactions using the Helius API, and visualizes buy/sell actions, protocol usage, and wallet activity using a Streamlit dashboard.

##  Project Overview

- 🧾 **Discover** the top 60 wallets holding a specific Solana token
- 🔄 **Real-time monitoring** of token-related transactions (buys/sells)
- 🛠️ **Identify** protocols used (e.g., Jupiter, Raydium, Orca)
- 📈 **Generate insights dashboard** for market trend analysis
- 🕰️ **Support historical analysis** with custom time filters


## 🧱 Project Structure

```
tokenwise/
├── backend/          # Core logic to fetch transactions & wallet data
│   ├── monitor.js
│   ├── getTopWallets.js
|   ├── wallet.db     #auto created
|   ├── tokenwise.db  #auto created
│   ├── database.js
│   └── .env
├── dashboard/        # Streamlit app for visualization
│   └── main.py
│   └── requirements.txt
├── README.md

```

## 🔧 Setup Instructions

### ✅ Prerequisites

- Node.js v18+
- Python 3.8+
- A Helius API Key (from https://www.helius.xyz/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/tokenwise.git
cd tokenwise
```

### 2. Backend Setup (Node.js)

```bash
cd backend
npm init -y
npm install axios dotenv better-sqlite3 @solana/web3.js
```

Create a `.env` file:

```env
HELIUS_API_KEY=your_helius_api_key
TARGET_TOKEN=your_token_mint
```

### 3. Frontend Setup (Streamlit)

```bash
cd ../dashboard
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install streamlit pandas
```

## ▶️ Run the Application

### 1. Start the Backend Script

```bash
cd backend
node monitor.js
```

This script:

- Fetches top 60 token holders
- Extracts their recent transactions
- Stores all data in SQLite DB (tokenwise.db)
- Refreshes data every 10 minutes

### 2. Launch the Dashboard

```bash
cd ../dashboard
streamlit run main.py
```

Access the dashboard at http://localhost:8501/

## 📉 Features on Dashboard

- 📈 Buy vs Sell Overview
- 🏛️ Protocol Usage Analytics
- 💰 Most Active Wallets
- ⏱️ Time-based Transaction Filtering

## ⚠️ Limitations

- 🧾 The Helius API has request limits , 100 transactions per api call(may be exhausted with frequent polling).
- 🐢 Transaction history is capped at ~150 per wallet (pagination workaround used).
- 🧪 Dashboard shows only simple counts and charts, no predictive or behavioral insights are provided.

## 🌱 Future Enhancements

- 🔔 Add notification system for big transactions (alerts).
- 🧠 Add AI-powered pattern recognition (swing traders, smart money, etc).


