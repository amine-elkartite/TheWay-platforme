<p align="center">
  <img src="assets/images/logo.png" alt="THEWAY Logo" width="420">
</p>

<p align="center">
  Intelligent Skills Matching Platform
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

The admin area is designed to manage the platform and monitor activity.

Current admin module:

- Admin dashboard
- Platform overview
- Future-ready structure for users, companies, offers, skills, subscriptions, support, and security management

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
