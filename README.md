
# SOC Dashboard 

## Overview

SOC Dashboard  is a full-stack cybersecurity incident monitoring dashboard designed to simulate a real-world Security Operations Center environment.

This project demonstrates:
- Full-stack software engineering
- REST API development
- JSON data handling
- Frontend & backend integration
- Cybersecurity workflows
- Data visualization
- Incident management systems

The goal of this project is to showcase practical engineering and cybersecurity skills for internships, graduate schemes, and junior SOC analyst roles.

---

# Features

## Cybersecurity Dashboard
- Monitor simulated security incidents
- View attack severity levels
- Track incident status
- Display attack source IP addresses

## REST API
- GET incidents
- POST incidents
- JSON-based backend architecture

## Search & Filtering
- Search by attack type
- Search by source IP
- Filter by severity

## Analytics
- Chart.js integration
- Incident visualization dashboard
- Alert monitoring metrics

## Modern UI
- Dark cybersecurity-inspired design
- Dashboard-style interface
- Responsive layout

---

# Tech Stack

## Frontend
- HTML5
- CSS3
- JavaScript

## Backend
- Node.js
- Express.js

## Database
- JSON storage

## Libraries
- Chart.js
- CORS

---

# Project Structure

```bash
soc-dashboard-pro/
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── dashboard.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── data/
│       └── incidents.json
│
├── screenshots/
├── README.md
└── .gitignore
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/soc-dashboard-pro.git
```

---

## Backend Setup

```bash
cd backend
npm install
node server.js
```

Backend runs on:

```bash
http://localhost:3000
```

---

## Frontend Setup

Open:

```bash
frontend/index.html
```

in your browser.

---

# API Documentation

## Get Incidents

```http
GET /incidents
```

### Example Response

```json
[
  {
    "id": 1,
    "severity": "Critical",
    "attackType": "Ransomware",
    "sourceIP": "192.168.1.10",
    "status": "Investigating"
  }
]
```

---

## Create Incident

```http
POST /incidents
```

### Example Request

```json
{
  "severity": "High",
  "attackType": "Brute Force",
  "sourceIP": "10.0.0.5",
  "status": "Open"
}
```


# Future Improvements

- JWT Authentication
- MongoDB integration
- Real SIEM log ingestion
- AI-generated threat summaries
- Docker deployment
- WebSocket live alerts
- Threat intelligence API integration
- Role-based access control

---

# Software Engineering Concepts Demonstrated

- RESTful API development
- Frontend/backend communication
- Asynchronous JavaScript
- JSON data architecture
- CRUD operations
- Modular project structure
- Responsive UI design
- Data visualization
- Version control with Git/GitHub

---

# Cybersecurity Concepts Demonstrated

- Incident response workflow
- Threat monitoring
- Attack categorization
- Severity analysis
- SOC operations simulation
- Log analysis principles

---

# Deployment

## Frontend
Recommended:
- Vercel
- Netlify

## Backend
Recommended:
- Render
- Railway

---


# Author

Richard Lamy

Cybersecurity & Software Engineering Student

---

# License

This project is licensed under the MIT License.
