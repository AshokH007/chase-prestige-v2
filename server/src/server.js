require('dotenv').config();
const app = require('./app');
const pool = require('./db').pool;
const https = require('https');
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);

    // ===== KEEP-ALIVE PING =====
    // Render free tier spins down after 15m of inactivity.
    // This pings /health every 14 minutes to keep the server warm,
    // preventing the 30-60 second cold-start delay on login.
    if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
        const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

        const pingServer = () => {
            const url = `${process.env.RENDER_EXTERNAL_URL}/health`;
            const client = url.startsWith('https') ? https : http;

            client.get(url, (res) => {
                console.log(`[Keep-Alive] Pinged ${url} — Status: ${res.statusCode}`);
            }).on('error', (err) => {
                console.warn(`[Keep-Alive] Ping failed: ${err.message}`);
            });
        };

        // Initial ping after 30s, then every 14 minutes
        setTimeout(() => {
            pingServer();
            setInterval(pingServer, PING_INTERVAL_MS);
        }, 30000);

        console.log('[Keep-Alive] Self-ping enabled. Server will stay warm.');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        pool.end(() => {
            console.log('Database pool closed');
        });
    });
});
