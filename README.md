# CryptoWeb
https://ai-iex.github.io/CryptoWeb/

**CryptoWeb** is a portfolio project showcasing backend development, API integration and a lightweight SPA front-end without heavy frameworks. It provides real-time crypto tracking, user management, market sentiment analysis and a simple chatbot demo.

> ⚠️ **Note:** All APIs used are free-tier services. They may have rate limits, slower updates or occasional endpoint changes.

---

## 📖 Description

CryptoWeb is a demonstration web app built to illustrate:

- Clean, scalable backend design with FastAPI  
- Vanilla HTML/CSS/JavaScript front-end  
- Integration with multiple free crypto market and sentiment APIs  
- User authentication & role-based access  
- Interactive data visualizations  

This project lives in a single repo as a monorepo—no separate frontend repo is needed.

---

## 🚀 Implemented Features

1. **Authentication & Role Control**  
   - User registration/login with JWT  
   - Admin vs. regular user routes  

2. **Crypto Tracking Dashboard**  
   - Real-time price fetch of top cryptocurrencies  
   - “Favorites” list per user  

3. **Fear & Greed Index**  
   - Current index display + color-coded circular gauge  
   - Historical cards and interactive Chart.js line chart (7/30/90 days)  

4. **Portfolio Management**  
   - View and manage your personal crypto portfolio  
   - Add, remove or adjust holdings  

5. **Chatbot with Portfolio & Favorites Tools**  
   - Conversational interface powered via Together.ai (MCP)  
   - Chatbot can query your portfolio and favorite coins directly as built-in tools  

6. **News Section**  
   - Browse latest crypto news filtered by country or topic  
   - Search and read articles from multiple news sites

7. **Auto-Generated API Docs**  
   - Swagger UI at `/docs`  

8. **Responsive Design & Theming**  
   - Light/dark mode toggle  
   - Mobile-friendly layouts 

---

## 🛠 Tech Stack

- **Frontend**: HTML5 · CSS3 · Vanilla JavaScript  
- **Backend**: Python 3 · FastAPI · SQLAlchemy · PostgreSQL (or MySQL)  
- **Auth**: JSON Web Tokens (JWT)  
- **Charts**: Chart.js  
- **Chatbot**: Together.ai with a free Model Context Protocol (MCP) integrated.
- **Deployment**: Backend: Docker · Front: Github Pages

---

## 🔗 Free APIs Used

- [Crypto Fear & Greed Index](https://alternative.me/crypto/fear-and-greed-index/)  
- [CoinGecko API](https://www.coingecko.com)  
- [Free News API](https://newsapi.org)
- [Free AI Models](https://www.together.ai/)

>⚠️ Be aware of daily call limits and occasional endpoint changes.

---

## 📁 Repo Structure

```

CryptoWeb/
├─ backend/            # FastAPI application
│   ├─ AgenteIA/       # chatbot service and agent config
│   ├─ Api/            # api routes
│   ├─ Core/           # config (env reader) and security.py
│   ├─ db/             # db config files
│   ├─ Models/         # tables
│   ├─ Repositories/   # CRUD methods
│   ├─ Schemas/        # DTOs, data transfer objects
│   └─ Services/       # business logic
│   ├─ main.py
├─ frontend/           # Static HTML/CSS/JS
│   ├─ index.html
│   ├─ pages/          # HTMLs
│   ├─ images/  
│   ├─ assets/
│   │   ├─ css/
│   │   └─ js/
├─ Dockerfile
└─ README.md

```

## 📌 Usage

1. Sign up or log in.
2. Browse real-time price data and add favorites.
3. View the current Fear & Greed Index and historical data.
4. Add your current portfolio and ask to the chatbot how to improve it.
5. Explore API via Swagger UI.

---

## 🤝 Contributions

This project is part of my personal portfolio. No pull requests are accepted, but feel free to fork and adapt for your own use.
