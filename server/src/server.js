require('dotenv').config();
const app = require('./app');
const { pool, initReady } = require('./db');
const https = require('https');
const http = require('http');

const PORT = process.env.PORT || 3000;

// Gate server startup on full DB initialization (tables + seed)
// This eliminates the race condition where a login request arrives
// before the notifications/user_credentials tables are created.
initReady.then(() => {
    console.log('✅ Database ready. Starting HTTP server...');

    const server = app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);

        // Keep-Alive Ping — prevents Render free-tier cold starts
        if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
            const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

            const pingServer = () => {
                const url = `${process.env.RENDER_EXTERNAL_URL}/health`;
                const client = url.startsWith('https') ? https : http;
                client.get(url, (res) => {
                    console.log(`[Keep-Alive] Pinged — Status: ${res.statusCode}`);
                }).on('error', (err) => {
                    console.warn(`[Keep-Alive] Ping failed: ${err.message}`);
                });
            };

            setTimeout(() => {
                pingServer();
                setInterval(pingServer, PING_INTERVAL_MS);
            }, 30000);

            console.log('[Keep-Alive] Self-ping enabled. Server stays warm.');
        }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received: closing server...');
        server.close(() => {
            pool.end(() => console.log('Database pool closed.'));
        });
    });

}).catch((err) => {
    console.error('❌ Fatal: Database init failed. Server will NOT start.', err.message);
    process.exit(1);
});
