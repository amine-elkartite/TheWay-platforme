# THEWAY

<p align="center">
  <img src="assets/images/logo.png" alt="THEWAY Logo" width="420">
</p>

<h2 align="center">THEWAY – Intelligent Skills Matching Platform</h2>

<p align="center">
  Une plateforme intelligente qui analyse les compétences, compare les profils avec les opportunités disponibles, et aide les utilisateurs à trouver le meilleur chemin vers leur avenir professionnel.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-blue">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green">
  <img src="https://img.shields.io/badge/Scraping-Python-yellow">
  <img src="https://img.shields.io/badge/Database-MySQL-orange">
  <img src="https://img.shields.io/badge/Status-In%20Development-purple">
</p>

---

## Overview

**THEWAY** is a professional web platform designed to help users discover opportunities based on their skills, CV, profile, and career goals.

The platform focuses on intelligent skills matching instead of simple job browsing.  
It compares user skills with opportunity requirements, identifies missing skills, tracks progression, and provides a more personalized career experience.

---

## Main Idea

Many job platforms only show opportunities.  
**THEWAY** goes further by answering an important question:

> “What skills do I have, what skills do I need, and which opportunities match my profile best?”

The goal is to build a smart bridge between:

- Users
- Skills
- CVs
- Opportunities
- Companies
- Career progression
- Intelligent matching

---

## Key Features

### Public Website

- Modern landing page
- Professional platform presentation
- About section
- Main visuals and branding
- User access to login and register pages

### Authentication

- User login
- User registration
- Account access management
- Clean and simple authentication pages

### Dashboard

- User overview
- Profile statistics
- Skills summary
- Opportunities overview
- Progress tracking
- Matching insights

### CV & Skills

- CV upload and management
- User skills management
- Competence tracking
- Skills comparison with market needs

### Opportunities

- Opportunities listing
- Opportunity details page
- Data loaded from CSV / JSON files
- Python scraping support
- Structured opportunity information

### Intelligent Matching

- Compare user skills with opportunity requirements
- Calculate matching score
- Show missing skills
- Suggest better opportunities
- Help users improve their career direction

### Progression

- Track user improvement
- Visualize learning progress
- Follow skill development
- Display user growth over time

### Settings

The platform includes multiple settings pages:

- Profile settings
- Account settings
- Preferences
- Notifications
- Privacy

### Admin Panel

The admin area is connected to the Express API and MySQL database.

- Dynamic dashboard
- Dynamic users, enterprises, offers, matching, skills, analytics, subscriptions, support, settings, and notifications
- Admin-only API routes protected by JWT and role checking
- Loading, empty, and error states on every admin page

---

## Installation

```bash
npm install
cd API
npm install
```

If `npm start` reports `Cannot find module 'express'`, run `npm install` inside `API/`.

---

## API Configuration

Create `API/.env`:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=theway
JWT_SECRET=change_this_secret
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:3001,http://localhost:8000,http://127.0.0.1:8000
```

Use the MySQL password configured in XAMPP/MAMP if your local `root` account is not passwordless.

---

## Database Import

Create/import the database:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS theway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p theway < database/database_structure.sql
mysql -u root -p theway < database/migrations/001_admin_tables.sql
```

The migration creates:

- `abonnement`
- `support_ticket`

These are required for the dynamic subscriptions and support pages.

---

## Run Backend

From the project root:

```bash
npm start
```

Backend URL:

```text
http://localhost:3001
```

Health check:

```text
http://localhost:3001/health
```

---

## Admin Login

Log in from:

```text
http://localhost:3001/view/authentification/login.html
```

Use an account from `utilisateur` with:

```text
role = admin
```

The frontend stores only the auth token and minimal session data. Admin panel records are loaded from MySQL through the API.

---

## Open Admin Panel

Dynamic admin URLs:

```text
/view/pannel/admin/dashboard.html
/view/pannel/admin/utilisateurs.html
/view/pannel/admin/entreprises.html
/view/pannel/admin/offres.html
/view/pannel/admin/matching.html
/view/pannel/admin/competences.html
/view/pannel/admin/analyses.html
/view/pannel/admin/abonnements.html
/view/pannel/admin/support.html
/view/pannel/admin/parametres.html
```

Existing internal page names also work:

```text
/view/pannel/admin/admin-dashboard.html
/view/pannel/admin/users.html
/view/pannel/admin/analyse.html
/view/pannel/admin/settings/generale.html
```

---

## Dynamic Admin API Routes

All admin routes require:

```http
Authorization: Bearer <token>
```

The token user must have `role = admin`.

```text
GET    /api/admin/dashboard

GET    /api/admin/users
GET    /api/admin/users/:id
POST   /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id

GET    /api/admin/enterprises
GET    /api/admin/enterprises/:id
POST   /api/admin/enterprises
PUT    /api/admin/enterprises/:id
DELETE /api/admin/enterprises/:id

GET    /api/admin/offers
GET    /api/admin/offers/:id
POST   /api/admin/offers
PUT    /api/admin/offers/:id
DELETE /api/admin/offers/:id

GET    /api/admin/skills
POST   /api/admin/skills
PUT    /api/admin/skills/:id
DELETE /api/admin/skills/:id

GET    /api/admin/matching
GET    /api/admin/analytics

GET    /api/admin/subscriptions
POST   /api/admin/subscriptions
PUT    /api/admin/subscriptions/:id
DELETE /api/admin/subscriptions/:id

GET    /api/admin/support
POST   /api/admin/support
PUT    /api/admin/support/:id
DELETE /api/admin/support/:id

GET    /api/admin/settings
PUT    /api/admin/settings

GET    /api/admin/notifications
POST   /api/admin/notifications
PUT    /api/admin/notifications/:id
DELETE /api/admin/notifications/:id
```

---

## Project Structure

```bash
THEWAY
├── API
│   └── server.js
│
├── Python
│   └── scraping.py
│
├── assets
│   ├── images
│   │   ├── about-background.png
│   │   ├── icon.png
│   │   ├── logo.png
│   │   └── main-background.png
│   │
│   └── uploads
│       ├── avatars
│       └── files
│           ├── opportunities.csv
│           └── opportunities.json
│
├── database
│   └── database.sql
│
├── view
│   ├── authentification
│   │   ├── login.html
│   │   └── register.html
│   │
│   ├── pannel
│   │   ├── admin
│   │   │   └── admin-dashboard.html
│   │   │
│   │   ├── settings
│   │   │   ├── compte.html
│   │   │   ├── confidentialité.html
│   │   │   ├── notification.html
│   │   │   ├── preference.html
│   │   │   └── profile.html
│   │   │
│   │   ├── cv_competences.html
│   │   ├── dashboard.html
│   │   ├── matching.html
│   │   ├── opportunity-details.html
│   │   ├── opportunity.html
│   │   ├── progression.html
│   │   └── skills.html
│   │
│   └── public
│       └── index.html
│
├── .gitignore
└── README.md
