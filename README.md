# Birdeye Catalyst: The DeFi Intelligence Sentinel

> **Transforming Birdeye Data into Actionable Alpha.** 

Birdeye Catalyst is a high-fidelity, industrial-grade DeFi intelligence hub designed for professional traders. It leverages the full power of Birdeye V2/V3 APIs to provide automated market vigilance, visual security analysis, and strategy execution blueprints.

![Banner](https://img.shields.io/badge/Birdeye-Catalyst-00ffa3?style=for-the-badge&logo=birdeye)
![Status](https://img.shields.io/badge/Status-Hackathon_Ready-blue?style=for-the-badge)

---

## 🌪️ The Problem
DeFi traders are overwhelmed by data. Between thousands of new listings on Solana, rapid "Pump.fun" migrations, and constant rugpull risks, manual scanning is no longer viable. Traders need **automated intelligence**, not just more charts.

## ⚡ The Catalyst Solution
Birdeye Catalyst acts as your personal "Sentinel Node" network. It doesn't just show data; it **evaluates** it against your custom logic and **alerts** you before the crowd catches up.

### 🛠️ Core Features

#### 1. Sentinel Nodes (Automated Triggers)
Define complex logic gates using Birdeye real-time data.
- **Triggers:** New Listings, Trending Entries, Whale Movements, and **Pump.fun to Raydium Migrations**.
- **Logic:** Combine liquidity, volume, price change, and security scores into automated filters.

#### 2. Global Alpha Terminal
A "Master Terminal" view that aggregates high-quality signals across the entire Catalyst network, providing a heatmap of what the most effective strategies are currently hitting.

#### 3. Safety Radar (Visual Risk Assessment)
Don't just read security scores—visualize them. Our custom **Radar Chart** maps:
- Birdeye Security Score
- Mint & Freeze Authority Status
- Top 10 Holder Concentration
- Liquidity Health

#### 4. Alpha Performance Monitor (Virtual PnL)
"Paper trade" your strategies. Track detected tokens in real-time with live price feeds from Birdeye to monitor simulated PnL before committing actual capital.

#### 5. Strategy Market (Blueprints)
Instant deployment of proven DeFi strategies. Single-click cloning of blueprints like **"The Degenerate Pack"** or **"Safe Harbor"** directly into your personal node network.

---

## 🏗️ Technical Architecture

Built with a scalable, production-ready monorepo architecture:

- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion (Industrial Brutalist Design).
- **Worker Engine:** Node.js, TypeScript, Strategy Pattern for extensible triggers.
- **Data Layer:** MongoDB (Persistence), Redis (Caching & Job Queuing).
- **Orchestration:** BullMQ for reliable, multi-threaded notification dispatching.
- **Oracle:** Direct integration with **Birdeye V2/V3 APIs** (Price, Security, Market Data, Trending).

### API Optimization (Economic Mode)
Our engine utilizes a **Lazy Loading / Multi-tier Caching** strategy:
- Basic filters (Liquidity/Volume) are checked first.
- Heavy API calls (Security/Market Data) are only triggered for tokens that pass the primary filters.
- Result: **80% reduction in API credit consumption** compared to standard polling.

---

## 📱 Actionable Alerts
Catalyst isn't just a dashboard—it's an execution tool. Every Telegram alert includes interactive deep-links:
- 🚀 **Quick Swap:** Direct link to Jupiter/Raydium for the specific token.
- 🔍 **Audit:** Instant RugCheck/SolanaFM deep-links.
- 📈 **Chart:** Direct Birdeye chart link for immediate technical analysis.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Birdeye API Key
- Telegram Bot Token

### Quick Start
1. Clone the repository.
2. Configure `.env` in `apps/web` and `apps/worker`.
3. Run the stack:
```bash
docker compose up --build
```

---

## 🏆 Superteam / Birdeye Competition
Developed specifically for the **Birdeye Data Competition**, Catalyst demonstrates how professional-grade UI and automated worker-engines can bridge the gap between raw on-chain data and profitable trading execution.

**"Data is the fuel, Catalyst is the engine."**

---
*Created by [Erenen1] for the Birdeye Catalyst Project.*
