const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// ==========================================
// ECLIPSEDPLAYBOT — DATABASE
// ==========================================

const databaseDir = path.join(__dirname, 'database');
const databasePath = path.join(databaseDir, 'eclipsedplaybot.db');

// Создаём папку database автоматически
if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, { recursive: true });
}

// Подключение к SQLite
const db = new sqlite3.Database(databasePath, (error) => {
    if (error) {
        console.error('❌ SQLite connection failed:', error.message);
        return;
    }

    console.log('✅ SQLite database connected');
    console.log(`📁 Database: ${databasePath}`);
});

// Включаем внешние ключи
db.run('PRAGMA foreign_keys = ON');

// ==========================================
// ИНИЦИАЛИЗАЦИЯ БАЗЫ
// ==========================================

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {

            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,

                    telegram_id INTEGER NOT NULL UNIQUE,

                    username TEXT,
                    first_name TEXT,
                    last_name TEXT,

                    title TEXT,

                    shards INTEGER NOT NULL DEFAULT 0,
                    stars INTEGER NOT NULL DEFAULT 0,
                    coins INTEGER NOT NULL DEFAULT 0,

                    cards_count INTEGER NOT NULL DEFAULT 0,

                    wins INTEGER NOT NULL DEFAULT 0,
                    draws INTEGER NOT NULL DEFAULT 0,
                    losses INTEGER NOT NULL DEFAULT 0,

                    rank TEXT NOT NULL DEFAULT 'Бронза',
                    rank_points INTEGER NOT NULL DEFAULT 0,

                    tower_floor INTEGER NOT NULL DEFAULT 0,

                    is_admin INTEGER NOT NULL DEFAULT 0,

                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            `, (error) => {

                if (error) {
                    console.error('❌ Users table creation failed:', error.message);
                    reject(error);
                    return;
                }

                // Индекс для быстрого поиска пользователя
                db.run(`
                    CREATE INDEX IF NOT EXISTS idx_users_telegram_id
                    ON users(telegram_id)
                `, (indexError) => {

                    if (indexError) {
                        console.error(
                            '❌ Users index creation failed:',
                            indexError.message
                        );

                        reject(indexError);
                        return;
                    }

                    console.log('✅ Users table initialized');

                    resolve();
                });
            });
        });
    });
}

// ==========================================
// СОЗДАНИЕ / ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
// ==========================================

function createOrUpdateUser(user, adminId = 0) {
    return new Promise((resolve, reject) => {

        if (!user || !user.id) {
            reject(new Error('Invalid Telegram user'));
            return;
        }

        const telegramId = Number(user.id);

        const username = user.username || null;
        const firstName = user.first_name || null;
        const lastName = user.last_name || null;

        // Проверяем, является ли пользователь администратором
        const isAdmin =
            telegramId === Number(adminId) &&
            Number(adminId) !== 0
                ? 1
                : 0;

        db.run(`
            INSERT INTO users (
                telegram_id,
                username,
                first_name,
                last_name,
                is_admin
            )
            VALUES (?, ?, ?, ?, ?)

            ON CONFLICT(telegram_id)
            DO UPDATE SET
                username = excluded.username,
                first_name = excluded.first_name,
                last_name = excluded.last_name,
                is_admin = excluded.is_admin,
                updated_at = CURRENT_TIMESTAMP
        `, [
            telegramId,
            username,
            firstName,
            lastName,
            isAdmin
        ], (error) => {

            if (error) {
                reject(error);
                return;
            }

            getUser(telegramId)
                .then(resolve)
                .catch(reject);
        });
    });
}

// ==========================================
// ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЯ
// ==========================================

function getUser(telegramId) {
    return new Promise((resolve, reject) => {

        db.get(
            `
            SELECT *
            FROM users
            WHERE telegram_id = ?
            `,
            [Number(telegramId)],
            (error, row) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(row || null);
            }
        );
    });
}

// ==========================================
// ЗАКРЫТИЕ БАЗЫ
// ==========================================

function closeDatabase() {
    return new Promise((resolve, reject) => {

        db.close((error) => {

            if (error) {
                reject(error);
                return;
            }

            console.log('✅ SQLite database closed');

            resolve();
        });
    });
}

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    db,
    databasePath,
    initializeDatabase,
    createOrUpdateUser,
    getUser,
    closeDatabase
};