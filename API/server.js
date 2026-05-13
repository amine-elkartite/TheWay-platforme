const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const fallbackStore = require('./lib/fallbackStore');
const createAuthRouter = require('./routes/auth');
const createActionsRouter = require('./routes/actions');
const createFilesRouter = require('./routes/files');
const createIntegrationsRouter = require('./routes/integrations');
const createSkillsRouter = require('./routes/skills');
const createProfileRouter = require('./routes/profile');
const createOpportunitiesRouter = require('./routes/opportunities');
const createPanelRouter = require('./routes/panel');
const {
    allowedOrigins,
    corsOrigin,
    signUserToken,
    verifyTokenValue
} = require('./lib/security');

const app = express();
const PORT = process.env.PORT || 3001;

function requiredEnv(name, allowEmpty) {
    if (process.env[name] === undefined || (!allowEmpty && process.env[name] === '')) {
        throw new Error(name + ' environment variable is required.');
    }
    return process.env[name];
}

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: requiredEnv('DB_USER'),
    password: requiredEnv('DB_PASSWORD', true),
    database: process.env.DB_NAME || 'theway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware
app.use(cors({
    origin: corsOrigin,
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

const viewDir = path.join(__dirname, '..', 'view');
const publicIndexPath = path.join(viewDir, 'public', 'index.html');

app.use('/view', express.static(viewDir));

app.get('/', (req, res) => {
    res.sendFile(publicIndexPath);
});

app.get('/authentification.html', (req, res) => {
    res.sendFile(path.join(viewDir, 'authentification', 'login.html'));
});

// File Upload Configuration
const uploadDir = path.join(__dirname, '..', 'assets', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(uploadDir, 'files');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ ok: false, error: 'Token manquant' });
    }
    
    try {
        const verification = verifyTokenValue(token);
        if (!verification.ok) {
            return res.status(401).json({ ok: false, error: 'Token invalide' });
        }
        if (!verification.decoded.id_user) {
            return res.status(401).json({ ok: false, error: 'Token invalide' });
        }
        req.userId = verification.decoded.id_user;
        req.userRole = verification.decoded.role || 'user';
        next();
    } catch (error) {
        res.status(401).json({ ok: false, error: 'Token invalide' });
    }
};

// Helper function to get database connection
async function getConnection() {
    return await pool.getConnection();
}

// ==========================================
// ROUTE MODULES
// ==========================================

const routeDeps = {
    getConnection: getConnection,
    verifyToken: verifyToken,
    upload: upload,
    fallbackStore: fallbackStore,
    signUserToken: signUserToken,
    rootDir: path.join(__dirname, '..'),
    opportunitiesFilePath: path.join(__dirname, '..', 'assets', 'uploads', 'files', 'opportunities.json')
};

app.use(createAuthRouter(routeDeps));
app.use(createActionsRouter(routeDeps));
app.use(createFilesRouter(routeDeps));
app.use(createIntegrationsRouter(routeDeps));
app.use(createSkillsRouter(routeDeps));
app.use(createProfileRouter(routeDeps));
app.use(createOpportunitiesRouter(routeDeps));
app.use(createPanelRouter(routeDeps));

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/health', (req, res) => {
    res.json({ ok: true, message: 'Server is running' });
});

// ==========================================
// ERROR HANDLING
// ==========================================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ ok: false, error: 'Erreur serveur' });
});

app.use((req, res) => {
    res.status(404).json({ ok: false, error: 'Route non trouvée' });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log(`🚀 TheWay API Server running on http://localhost:${PORT}`);
    console.log('📝 Database:', process.env.DB_NAME);
    console.log('🔑 JWT Secret configured:', true);
    console.log('🌐 CORS origins:', allowedOrigins.join(', '));
});

module.exports = app;
