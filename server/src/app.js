const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const transactionRoutes = require('./routes/transactions');
const staffRoutes = require('./routes/staff');
const cardRoutes = require('./routes/cards');
const billRoutes = require('./routes/bills');
const analyticsRoutes = require('./routes/analytics');
const loanRoutes = require('./routes/loans');
const investmentRoutes = require('./routes/investments');
const aiRoutes = require('./routes/ai');
const searchRoutes = require('./routes/search');
const { authenticate } = require('./middleware/auth');

// Database connection
const { pool: dbPool } = require('./db');

const app = express();

// Middleware
app.use(helmet());

// Dynamic CORS Configuration
const rawFrontendUrl = process.env.FRONTEND_URL;
const allowedOrigins = [
    rawFrontendUrl,
    // Add protocol versions for CORS matching
    rawFrontendUrl && !rawFrontendUrl.startsWith('http') ? `https://${rawFrontendUrl}` : null,
    rawFrontendUrl && !rawFrontendUrl.startsWith('http') ? `http://${rawFrontendUrl}` : null,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow developer tools and local testing
        if (!origin || process.env.NODE_ENV === 'development') return callback(null, true);

        const normalize = (o) => o.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        const normalizedOrigin = normalize(origin);

        const isAllowed = allowedOrigins.some(ao => ao && normalize(ao) === normalizedOrigin);

        // Safety clause: Always allow the onrender.com subdomains of this project
        if (isAllowed || normalizedOrigin.endsWith('onrender.com')) {
            callback(null, true);
        } else {
            console.error(`[CORS REJECTED] Origin: ${origin} | Target: ${normalizedOrigin} | Allowed:`, allowedOrigins.map(normalize));
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Basic Root Route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'FinTech Banking Platform API',
        environment: 'Production',
        status: 'Operational',
        documentation: 'https://github.com/AshokH007/banking-platform-simulation',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            account: '/api/account',
            staff: '/api/staff',
            cards: '/api/cards',
            bills: '/api/bills',
            analytics: '/api/analytics',
            loans: '/api/loans',
            investments: '/api/investments',
            ai: '/api/ai',
            search: '/api/search'
        }
    });
});

// Enhanced Health Check & Schema Audit
app.get('/health', async (req, res) => {
    try {
        const dbCheck = await dbPool.query('SELECT COUNT(*) FROM banking.users');
        res.status(200).json({
            status: 'ok',
            database: 'connected',
            schema: 'active',
            user_count: dbCheck.rows[0].count,
            diagnostics: {
                has_jwt_secret: !!process.env.JWT_SECRET,
                node_env: process.env.NODE_ENV
            },
            timestamp: new Date()
        });
    } catch (err) {
        console.error('[Health Check Failure]:', err.message);
        res.status(503).json({
            status: 'error',
            database: 'connected',
            schema: 'uninitialized',
            error: err.message,
            timestamp: new Date()
        });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        message: `The requested resource ${req.originalUrl} was not found.`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Global Error]', err);

    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: statusCode === 500 ? 'Internal Server Error' : err.name,
        message: statusCode === 500 ? 'An unexpected error occurred.' : message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;
