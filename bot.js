const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const {
    initializeDatabase,
    createOrUpdateUser,
    getUser,
    closeDatabase
} = require('./database');

// ===============================
// ENV
// ===============================

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID || 0);

if (!TOKEN) {
    console.error('❌ BOT_TOKEN отсутствует в Environment');
    process.exit(1);
}

// ===============================
// BOT
// ===============================

const bot = new TelegramBot(TOKEN, {
    polling: true
});

console.log('🌑 EclipsedPlayBot started');

// ===============================
// ADMIN CHECK
// ===============================

function isAdmin(id) {
    return Number(id) === ADMIN_ID && ADMIN_ID !== 0;
}

// ===============================
// DATABASE
// ===============================

initializeDatabase()
    .then(() => {
        console.log('✅ Database initialized');
    })
    .catch((error) => {
        console.error(
            '❌ Database initialization failed:',
            error.message
        );
    });

// ===============================
// USER REGISTRATION
// ===============================

async function ensureUser(user) {
    try {
        return await createOrUpdateUser(user, ADMIN_ID);
    } catch (error) {
        console.error(
            '❌ User database error:',
            error.message
        );

        return null;
    }
}

// ===============================
// MAIN REPLY KEYBOARD
// ===============================

function getMainKeyboard() {
    return {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: '⚔️ Получить карту'
                    },
                    {
                        text: '🍀 Получить карту'
                    }
                ],

                [
                    {
                        text: '🎴 Мои карты'
                    }
                ],

                [
                    {
                        text: '⚜️ Сражение'
                    },
                    {
                        text: '👤 Профиль'
                    },
                    {
                        text: '🛡️ Клан'
                    }
                ],

                [
                    {
                        text: '🧧 Магазин'
                    },
                    {
                        text: '☰ Меню'
                    }
                ]
            ],

            resize_keyboard: true
        }
    };
}

// ===============================
// PROFILE TEXT
// ===============================

function buildProfileText(user, telegramUser) {
    if (!user) {
        return '👤 ПРОФИЛЬ\n\n❌ Не удалось загрузить профиль.';
    }

    const username =
        telegramUser.username
            ? `@${telegramUser.username}`
            : telegramUser.first_name || 'Игрок';

    const title = user.title || 'Не выбран';

    return `👤 ПРОФИЛЬ (${MENTION})
``📜 Титул: ${title}``

💠 Осколки — ${user.shards}
✨ Звёзды — ${user.stars}
🪙 Коины — ${user.coins}

🎴 Карты — ${user.cards_count}

Победа/ничья/поражение:
${user.wins}/${user.draws}/${user.losses}

🏆 Ранг — ${user.rank}
🏰 Башня — ${user.tower_floor} этаж`;
}

// ===============================
// PROFILE INLINE KEYBOARD
// ===============================

function getProfileKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '⚜️ Кастомизация',
                        callback_data: 'custom'
                    }
                ],

                [
                    {
                        text: '🎴 Мои карты',
                        callback_data: 'cards'
                    }
                ]
            ]
        }
    };
}

// ===============================
// START COMMAND
// ===============================

bot.onText(/^\/start$/, async (msg) => {

    const chatId = msg.chat.id;

    // Создаём / обновляем пользователя в SQLite
    await ensureUser(msg.from);

    const keyboard = getMainKeyboard();

    const image = path.join(
        __dirname,
        'assets',
        'welcome.png'
    );

    const welcomeText =
        '🌑 Добро пожаловать в Eclipse!\n\n' +
        '⚔️ Сражайся на арене, обменивайся картами, ' +
        'ищи друзей и развивайтесь вместе ✨';

    try {

        if (fs.existsSync(image)) {

            await bot.sendPhoto(
                chatId,
                image,
                {
                    caption: welcomeText,
                    ...keyboard
                }
            );

        } else {

            console.warn(
                '⚠️ assets/welcome.png не найден'
            );

            await bot.sendMessage(
                chatId,
                welcomeText,
                keyboard
            );
        }

    } catch (error) {

        console.error(
            '❌ START ERROR:',
            error.message
        );

    }
});

// ===============================
// MAIN MESSAGE HANDLER
// ===============================

bot.on('message', async (msg) => {

    // Не обрабатываем команды здесь
    if (msg.text && msg.text.startsWith('/')) {
        return;
    }

    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) {
        return;
    }

    // Обновляем данные пользователя в БД
    await ensureUser(msg.from);

    // ===============================
    // PROFILE
    // ===============================

    if (text === '👤 Профиль') {

        const user = await getUser(msg.from.id);

        const profileText = buildProfileText(
            user,
            msg.from
        );

        await bot.sendMessage(
            chatId,
            profileText,
            getProfileKeyboard()
        );

        return;
    }

    // ===============================
    // MY CARDS
    // ===============================

    if (text === '🎴 Мои карты') {

        await bot.sendMessage(
            chatId,
            '🎴 МОИ КАРТЫ\n\n' +
            'Пока ваша коллекция пуста.',
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '💼 Мои колоды',
                                callback_data: 'decks'
                            }
                        ],
                        [
                            {
                                text: '(Назад)',
                                callback_data: 'back'
                            }
                        ]
                    ]
                }
            }
        );

        return;
    }

    // ===============================
    // BATTLE
    // ===============================

    if (text === '⚜️ Сражение') {

        await bot.sendMessage(
            chatId,
            '⚜️ Сражение',
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔱 Арена',
                                callback_data: 'arena'
                            },
                            {
                                text: '🏰 Башня',
                                callback_data: 'tower'
                            }
                        ],
                        [
                            {
                                text: '(Назад)',
                                callback_data: 'back'
                            }
                        ]
                    ]
                }
            }
        );

        return;
    }

    // ===============================
    // MENU
    // ===============================

    if (text === '☰ Меню') {

        await sendMenu(chatId);

        return;
    }

    // ===============================
    // GET CARD
    // ===============================

    if (text === '⚔️ Получить карту') {

        await bot.sendMessage(
            chatId,
            '⚔️ Обычная крутка\n\n' +
            'Функционал получения карты будет подключён позже.'
        );

        return;
    }

    // ===============================
    // LIMITED CARD
    // ===============================

    if (text === '🍀 Получить карту') {

        await bot.sendMessage(
            chatId,
            '🍀 Лимитированная крутка\n\n' +
            'Функционал лимитированных карт будет подключён позже.'
        );

        return;
    }

    // ===============================
    // CLAN
    // ===============================

    if (text === '🛡️ Клан') {

        await bot.sendMessage(
            chatId,
            '🛡️ Клан\n\n' +
            'Клановая система будет подключена позже.'
        );

        return;
    }

    // ===============================
    // SHOP
    // ===============================

    if (text === '🧧 Магазин') {

        await bot.sendMessage(
            chatId,
            '🧧 Магазин\n\n' +
            'Магазин будет подключён позже.'
        );

        return;
    }
});

// ===============================
// MENU FUNCTION
// ===============================

async function sendMenu(chatId) {

    const buttons = [
        [
            {
                text: '🏆 Ранги',
                callback_data: 'ranks'
            }
        ],

        [
            {
                text: '📜 Титулы',
                callback_data: 'titles'
            }
        ],

        [
            {
                text: '🎖 Достижения',
                callback_data: 'achievements'
            }
        ]
    ];

    await bot.sendMessage(
        chatId,
        '☰ Меню',
        {
            reply_markup: {
                inline_keyboard: buttons
            }
        }
    );
}

// ===============================
// CALLBACK QUERY
// ===============================

bot.on('callback_query', async (query) => {

    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;

    // Убираем "часики" с кнопки
    try {
        await bot.answerCallbackQuery(query.id);
    } catch (error) {
        // Ничего критичного
    }

    // Обновляем пользователя
    await ensureUser(query.from);

    // ===============================
    // MY CARDS
    // ===============================

    if (data === 'cards') {

        await bot.sendMessage(
            chatId,
            '🎴 МОИ КАРТЫ\n\n' +
            'Пока ваша коллекция пуста.',
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '💼 Мои колоды',
                                callback_data: 'decks'
                            }
                        ],
                        [
                            {
                                text: '(Назад)',
                                callback_data: 'back'
                            }
                        ]
                    ]
                }
            }
        );

        return;
    }

    // ===============================
    // CUSTOMIZATION
    // ===============================

    if (data === 'custom') {

        const buttons = [
            [
                {
                    text: '📜 Титулы',
                    callback_data: 'titles'
                }
            ],

            [
                {
                    text: '🎖 Достижения',
                    callback_data: 'achievements'
                }
            ]
        ];

        // Админская кнопка видна только руководству
        if (isAdmin(userId)) {

            buttons.push([
                {
                    text: '❤️ Админ панель',
                    callback_data: 'admin'
                }
            ]);
        }

        buttons.push([
            {
                text: '(Назад)',
                callback_data: 'back'
            }
        ]);

        await bot.sendMessage(
            chatId,
            '⚜️ Кастомизация',
            {
                reply_markup: {
                    inline_keyboard: buttons
                }
            }
        );

        return;
    }

    // ===============================
    // ADMIN PANEL
    // ===============================

    if (data === 'admin') {

        if (!isAdmin(userId)) {

            await bot.sendMessage(
                chatId,
                '❌ У вас нет доступа к админ-панели.'
            );

            return;
        }

        await bot.sendMessage(
            chatId,
            '❤️ АДМИН ПАНЕЛЬ\n\n' +
            'Доступ разрешён.\n\n' +
            'Инструменты управления будут подключены позже.'
        );

        return;
    }

    // ===============================
    // TITLES
    // ===============================

    if (data === 'titles') {

        await bot.sendMessage(
            chatId,
            '📜 Титулы\n\n' +
            'Пока список титулов пуст.'
        );

        return;
    }

    // ===============================
    // ACHIEVEMENTS
    // ===============================

    if (data === 'achievements') {

        await bot.sendMessage(
            chatId,
            '🎖 ДОСТИЖЕНИЯ\n\n' +
            'Страница 1/1',
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '⬅️',
                                callback_data: 'prev'
                            },
                            {
                                text: '1/1',
                                callback_data: 'page'
                            },
                            {
                                text: '➡️',
                                callback_data: 'next'
                            }
                        ],

                        [
                            {
                                text: '(Назад)',
                                callback_data: 'menu'
                            }
                        ]
                    ]
                }
            }
        );

        return;
    }

    // ===============================
    // RANKS
    // ===============================

    if (data === 'ranks') {

        await bot.sendMessage(
            chatId,
            '🏆 РАНГИ\n\n' +
            '🏆 Бронза — 0+\n\n' +
            'Остальные ранги будут подключены позже.'
        );

        return;
    }

    // ===============================
    // ARENA
    // ===============================

    if (data === 'arena') {

        await bot.sendMessage(
            chatId,
            '🔱 АРЕНА\n\n' +
            'Система PvP будет подключена позже.'
        );

        return;
    }

    // ===============================
    // TOWER
    // ===============================

    if (data === 'tower') {

        await bot.sendMessage(
            chatId,
            '🏰 БАШНЯ\n\n' +
            'Ваш текущий этаж: 0\n\n' +
            'Система Башни будет подключена позже.'
        );

        return;
    }

    // ===============================
    // DECKS
    // ===============================

    if (data === 'decks') {

        await bot.sendMessage(
            chatId,
            '💼 МОИ КОЛОДЫ\n\n' +
            'У вас пока нет созданных колод.',
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '➕ Добавить колоду',
                                callback_data: 'add_deck'
                            }
                        ],
                        [
                            {
                                text: 'Назад',
                                callback_data: 'cards'
                            }
                        ]
                    ]
                }
            }
        );

        return;
    }

    // ===============================
    // BACK
    // ===============================

    if (data === 'back') {

        await bot.sendMessage(
            chatId,
            '🌑 Главное меню',
            getMainKeyboard()
        );

        return;
    }

    // ===============================
    // MENU BACK
    // ===============================

    if (data === 'menu') {

        await sendMenu(chatId);

        return;
    }

    // ===============================
    // PAGINATION PLACEHOLDERS
    // ===============================

    if (data === 'prev' || data === 'next' || data === 'page') {

        await bot.answerCallbackQuery(
            query.id,
            {
                text: 'Система страниц будет подключена позже.'
            }
        );

        return;
    }

    // ===============================
    // FUTURE DECK CREATION
    // ===============================

    if (data === 'add_deck') {

        await bot.sendMessage(
            chatId,
            '💬 Введите название для колоды\n\n' +
            'Функционал создания колод будет подключён следующим этапом.',
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🚫 Отмена',
                                callback_data: 'back'
                            }
                        ]
                    ]
                }
            }
        );

        return;
    }
});

// ===============================
// ERROR HANDLERS
// ===============================

bot.on('polling_error', (error) => {

    console.error(
        '❌ Telegram polling error:',
        error.message
    );

});

// ===============================
// GRACEFUL SHUTDOWN
// ===============================

async function shutdown(signal) {

    console.log(
        `🛑 Received ${signal} - Shutting down gracefully...`
    );

    try {

        await bot.stopPolling();

    } catch (error) {

        console.error(
            '⚠️ Polling stop error:',
            error.message
        );

    }

    try {

        await closeDatabase();

    } catch (error) {

        console.error(
            '⚠️ Database close error:',
            error.message
        );

    }

    process.exit(0);
}

process.on('SIGINT', () => {
    shutdown('SIGINT');
});

process.on('SIGTERM', () => {
    shutdown('SIGTERM');
});

// ===============================
// EXPORT
// ===============================

module.exports = {
    bot,
    isAdmin
};