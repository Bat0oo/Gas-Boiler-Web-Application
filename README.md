# Gas Boiler Management System 🔥

A full-stack web application for monitoring and managing gas boiler heating systems across multiple buildings, featuring real-time temperature control via a P-controller algorithm.

## 🔍 Overview

This project simulates a realistic heating system for buildings using gas boilers. It features automatic temperature regulation through a Proportional (P) controller, real-time WebSocket updates, integration with OpenWeatherMap API, and a full management interface for buildings, boilers, users, and alarms.

## 🧰 Project Structure

```
Gas-Boiler/
├── Gas-Boiler-Backend/          # .NET 8 Web API
│   ├── Controllers/             # REST API endpoints
│   ├── Services/                # P-controller, Weather, Alarms
│   ├── Repositories/            # Data access layer
│   ├── Models/                  # Entity models
│   └── Hubs/                    # SignalR WebSocket hub
├── gas-boiler-frontend/         # React + TypeScript SPA
│   ├── components/              # MapView, Dashboard, Charts
│   └── pages/                   # Buildings, Boilers, Admin
```

## 🚀 Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- SQL Server
- OpenWeatherMap API key

### Backend Setup

```bash
cd Gas-Boiler-Backend
# Update connection string and API key in appsettings.json
dotnet ef database update
dotnet run
```

### Frontend Setup

```bash
cd gas-boiler-frontend
npm install
npm run dev
```

### Access the Application

- Frontend: `http://localhost:3000`
- Backend API: `https://localhost:44314/api`
- Swagger: `https://localhost:44314/swagger/index.html`

### Default Admin Credentials

Check `appsettings.json` for seeded admin account.

## ✨ Key Features

- **P-Controller** — Automatic boiler power regulation every 60 seconds based on temperature error
- **Real-time updates** — SignalR WebSocket pushes live temperature and boiler status to frontend
- **Interactive map** — Leaflet map with building markers and live temperature overlays
- **Alarm system** — Automatic detection of insufficient boiler capacity
- **Historical data** — Temperature, heat loss, and cost charts via Chart.js
- **CSV export** — Download historical building data
- **Role-based access** — Admin and User roles with separate permissions
- **Weather integration** — OpenWeatherMap API for outdoor temperature and heat loss calculation

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Leaflet, Chart.js, SignalR Client, Axios |
| Backend | ASP.NET Core (.NET 8), C#, SignalR, Background Services |
| Database | SQL Server, Entity Framework Core |
| Auth | JWT Bearer Tokens, BCrypt |
| External API | OpenWeatherMap |

## ⚙️ How the P-Controller Works

Every 60 seconds the background service:

1. Fetches all buildings from the database
2. Calculates indoor temperature using a thermodynamic model:
   ```
   Q_net = Q_generated - Q_lost
   ΔT = (Q_net × Δt) / (ThermalMass × Volume)
   ```
3. Calculates error: `error = desiredTemperature - indoorTemperature`
4. Applies proportional control with three modes:
   - 🔴 **Too hot** → boiler power = 0
   - 🟡 **Within deadband (±0.3°C)** → maintain feedforward only
   - 🟢 **Normal** → `newPower = feedForward + error × Kp (1.5)`
5. Distributes power evenly across all boilers
6. Saves results to database and broadcasts via SignalR

## 🗄️ Database Schema

6 tables: `Users`, `BuildingObjects`, `GasBoilers`, `BuildingReadings`, `Alarms`, `SystemParameters`

Key relationships:
- Users → BuildingObjects (1:N)
- BuildingObjects → GasBoilers (1:N)
- BuildingObjects → BuildingReadings (1:N)
- BuildingObjects → Alarms (1:N)

## 👤 User Roles

| Feature | Admin | User |
|---|---|---|
| Register / Login | ✔ | ✔ |
| Create buildings & boilers | ✖ | ✔ |
| View charts & costs | ✔ | ✔ |
| Manage users / block accounts | ✔ | ✖ |
| Configure system parameters | ✔ | ✖ |
| Export CSV | ✔ | ✔ |

## 📂 Use Cases

- University project demonstrating automatic control systems
- Learning full-stack development with .NET and React
- Simulation of real-world heating management systems
- Demonstration of real-time WebSocket communication with SignalR
