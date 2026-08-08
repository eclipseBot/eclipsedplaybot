```javascript
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// ECLIPSEDPLAYBOT — SERVER
// ==========================================

app.use(express.json());

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'EclipsedPlayBot by Eclipsed Team is running',
        timestamp: new Date().toISOString(),
        service: 'EclipsedPlayBot',
        creator: 'Eclipsed Team',
        version: '1.0.0'
    });
});

// ==========================================
// ROOT
// ==========================================

app.get('/', (req, res) => {
    res.json({
        message: '🌑 EclipsedPlayBot by Eclipsed Team',
        status: 'Server is running smoothly',
        endpoints: {
            health: '/health',
            status: '/status'
        }
    });
});

// ==========================================
// STATUS
// ==========================================

app.get('/status', (req, res) => {
    res.json({
        bot: {
            name: 'EclipsedPlayBot',
            creator: 'Eclipsed Team',
            version: '1.0.0',
            status: 'Active and Running'
        },
        server: {
            node_version: process.version,
            uptime: Math.floor(process.uptime()) + ' seconds',
            memory:
                Math.round(
                    process.memoryUsage().heapUsed / 1024 / 1024
                ) + ' MB'
        }
    });
});

// ==========================================
// START SERVER
// ==========================================

const server = app.listen(PORT, '0.0.0.0', () => {
console.log('=================================');
console.log('ECLIPSEDPLAYBOT');
console.log('Eclipsed Team');
console.log('Server started successfully!');
console.log('Port:', PORT);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Started at:', new Date().toISOString());
console.log('=================================');

    startBot();
});

// ==========================================
// BOT STARTER
// ==========================================

function startBot() {
    try {
        console.log('🤖 Loading EclipsedPlayBot...');

        const botModule = require('./bot');

        if (botModule && botModule.bot) {
            console.log('✅ EclipsedPlayBot loaded successfully!');
            console.log('🎴 Game systems: Ready for development');
            console.log('💬 Commands: Ready');
            console.log('🛡️ Core system: Operational');
        } else {
            console.log('⚠️ Bot loaded but may have issues');
        }

    } catch (error) {
        console.error('❌ Bot loading failed:', error.message);
        console.log('ℹ️ Server is running, but bot features are disabled');
    }
}

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

function shutdown(signal) {
    console.log(`\n🛑 Received ${signal} - Shutting down gracefully...`);

    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
```