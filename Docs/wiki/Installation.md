# Installation

This page explains how to install and run **TheWay** in a local development environment.

---

## Requirements

Before starting, make sure you have the following tools installed:

- Node.js
- npm
- MySQL
- Git
- Python

---

## Clone the Repository

```bash
git clone https://github.com/amine-elkartite/TheWay-platforme.git
cd TheWay-platforme
```

---

## Install Dependencies

```bash
npm install
```

If the project contains separated frontend and backend folders, install dependencies inside each required folder.

---

## Configure the Environment

Create the required environment configuration files locally.

Do not publish private configuration files, passwords, tokens, API keys, or database credentials in the public repository.

---

## Database Setup

Create a local MySQL database for the project and import the database structure from the database folder if available.

Recommended steps:

1. Create a new database.
2. Import the SQL schema.
3. Verify the database connection.
4. Start the backend server.

---

## Start the Application

```bash
npm start
```

For backend-only execution, run the server file from the API folder according to the project configuration.

---

## Development Notes

- Keep private files out of GitHub.
- Use a `.gitignore` file.
- Test the application before pushing changes.
- Keep documentation updated after major changes.

---

## Back to Wiki

Return to [Home](Home.md).
