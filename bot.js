```javascript
const TelegramBot = require('node-telegram-bot-api');

// ==========================================
// ECLIPSEDPLAYBOT — BOT CORE
// Eclipsed Team
// ==========================================

// Telegram token берём из Environment Variables.
// Токен никогда не хранится непосредственно в коде.
const token = process.env.BOT_TOKEN;

if (!token) {
    console.error('❌ BOT_TOKEN is not configured.');
    throw new Error('BOT_TOKEN environment variable is required.');
}

// ==========================================
// TELEGRAM BOT
// ==========================================

const bot = new TelegramBot(token, {
    polling: true
});

// ==========================================
// /start
// ==========================================

bot.onText(/^\/start$/, async (msg) => {
    const chatId = msg.chat.id;

    const username = msg.from.username
        ? `@${msg.from.username}`
        : msg.from.first_name || 'Игрок';

    try {
        await bot.sendMessage(
            chatId,
            `🌑 ECLIPSEDPLAYBOT\n\n` +
            `Добро пожаловать, ${username}!\n\n` +
            `🎴 Карточная система\n` +
            `⚔️ Арена\n` +
            `🏰 Башня\n` +
            `🏆 Ранги\n` +
            `📜 Титулы\n` +
            `🎖 Достижения\n` +
            `🛡 Кланы\n\n` +
            `🚀 Игровая система EclipsedPlayBot находится в разработке.`
        );
    } catch (error) {
        console.error('❌ /start error:', error.message);
    }
});

// ==========================================
// /help
// ==========================================

bot.onText(/^\/help$/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        await bot.sendMessage(
            chatId,
            `🌑 ECLIPSEDPLAYBOT\n\n` +
            `📌 Основные системы:\n\n` +
            `👤 Профиль\n` +
            `🎴 Карты и коллекция\n` +
            `⚔️ Арена\n` +
            `🏰 Башня\n` +
            `🏆 Ранги\n` +
            `📜 Титулы\n` +
            `🎖 Достижения\n` +
            `🛡 Кланы\n\n` +
            `Новые игровые функции будут подключаться поэтапно.`
        );
    } catch (error) {
        console.error('❌ /help error:', error.message);
    }
});

// ==========================================
// TELEGRAM EVENTS
// ==========================================

bot.on('polling_error', (error) => {
    console.error('❌ Telegram polling error:', error.message);
});

bot.on('error', (error) => {
    console.error('❌ Telegram bot error:', error.message);
});

// ==========================================
// BOT INFORMATION
// ==========================================

bot.getMe()
    .then((me) => {
        console.log('=================================');
        console.log('🌑 ECLIPSEDPLAYBOT');
        console.log('👥 Eclipsed Team');
        console.log(`🤖 Bot: @${me.username}`);
        console.log(`🆔 Telegram ID: ${me.id}`);
        console.log('📡 Telegram connection: ACTIVE');
        console.log('=================================');
    })
    .catch((error) => {
        console.error('❌ Failed to connect to Telegram:', error.message);
    });

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    bot
};
```
