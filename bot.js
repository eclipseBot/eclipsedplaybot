const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  throw new Error('BOT_TOKEN is not configured.');
}

const bot = new TelegramBot(TOKEN, {
  polling: true
});

// ============================================================
// 🌑 ECLIPSEDPLAYBOT
// Визуальная часть интерфейса.
// Реальные БД, карты, бои, кланы, экономика и т.д.
// подключаются отдельно.
// ============================================================

// ============================================================
// 🔐 ADMIN ACCESS
//
// Render Environment Variable:
//
// ADMIN_IDS=123456789,987654321
//
// Обычные пользователи не увидят кнопку админ-панели.
// ============================================================

const ADMIN_IDS = new Set(
  (process.env.ADMIN_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)
);

function isAdmin(userId) {
  return ADMIN_IDS.has(String(userId));
}

// ============================================================
// 🧠 USER SESSIONS
// ============================================================

const sessions = new Map();

// ============================================================
// 👤 USERNAME
// ============================================================

function usernameOf(msg) {
  if (msg.from.username) {
    return `@${msg.from.username}`;
  }

  return msg.from.first_name || 'Игрок';
}

// ============================================================
// 📱 MAIN KEYBOARD
//
// Структура:
// 2
// 1
// 3
// 2
// ============================================================

function mainKeyboard() {
  return {
    keyboard: [
      [
        { text: '⚔️ Получить карту' },
        { text: '🍀 Получить карту' }
      ],
      [
        { text: '🎴 Мои карты' }
      ],
      [
        { text: '⚜️ Сражение' },
        { text: '👤 Профиль' },
        { text: '🛡️ Клан' }
      ],
      [
        { text: '🧧 Магазин' },
        { text: '☰ Меню' }
      ]
    ],
    resize_keyboard: true
  };
}

// ============================================================
// 🔙 SIMPLE BACK
// ============================================================

function backKeyboard() {
  return {
    keyboard: [
      [
        { text: 'Назад' }
      ]
    ],
    resize_keyboard: true
  };
}

// ============================================================
// ☰ MENU
// ============================================================

function menuKeyboard(userId) {
  const rows = [
    [
      { text: '🏆 Ранги' }
    ],
    [
      { text: '📜 Титулы' }
    ],
    [
      { text: '🎖 Достижения' }
    ]
  ];

  // Админская кнопка полностью скрыта
  // от обычных пользователей.
  if (isAdmin(userId)) {
    rows.push([
      { text: '❤️ Админ панель' }
    ]);
  }

  rows.push([
    { text: 'Назад' }
  ]);

  return {
    keyboard: rows,
    resize_keyboard: true
  };
}

// ============================================================
// ⚜️ BATTLE
// ============================================================

function battleKeyboard() {
  return {
    keyboard: [
      [
        { text: '🔱 Арена' },
        { text: '🏰 Башня' }
      ],
      [
        { text: 'Назад' }
      ]
    ],
    resize_keyboard: true
  };
}

// ============================================================
// ⚜️ CUSTOMIZATION
//
// Для обычного игрока:
//
// [ 📜 Титулы ]
// [ 🎖 Достижения ]
// [ ◀️ Назад ]
//
// Для руководства:
//
// [ 📜 Титулы ]
// [ 🎖 Достижения ]
// [ ❤️ Админ панель ]
// [ ◀️ Назад ]
// ============================================================

function customizationKeyboard(userId) {
  const rows = [
    [
      { text: '📜 Титулы' }
    ],
    [
      { text: '🎖 Достижения' }
    ]
  ];

  if (isAdmin(userId)) {
    rows.push([
      { text: '❤️ Админ панель' }
    ]);
  }

  rows.push([
    { text: '◀️ Назад' }
  ]);

  return {
    keyboard: rows,
    resize_keyboard: true
  };
}

// ============================================================
// 🎴 MY CARDS
// ============================================================

function cardsKeyboard() {
  return {
    keyboard: [
      [
        { text: 'Название ➕' },
        { text: 'Вселенные ➕' }
      ],
      [
        { text: 'Редкости ➕' },
        { text: 'Классы ➕' }
      ],
      [
        { text: 'Рейтинг ⏬' },
        { text: '🍀 | ☑️' },
        { text: 'Дата ⏬' }
      ],
      [
        { text: 'Очистить 🗑' },
        { text: '💮' },
        { text: 'Карты ⏩' }
      ],
      [
        { text: '💼 Мои колоды' }
      ]
    ],
    resize_keyboard: true
  };
}

// ============================================================
// 💼 DECK LIST
// ============================================================

function deckListKeyboard(hasDeck = false, deckName = null) {
  const rows = [];

  if (hasDeck && deckName) {
    rows.push([
      { text: `💼 ${deckName} | 0` }
    ]);
  }

  rows.push([
    { text: '➕ Добавить колоду' }
  ]);

  rows.push([
    { text: 'Назад' }
  ]);

  return {
    keyboard: rows,
    resize_keyboard: true
  };
}

// ============================================================
// ➕ DECK CREATION
// ============================================================

function deckCreateKeyboard() {
  return {
    keyboard: [
      [
        { text: '🚫 Отмена' }
      ]
    ],
    resize_keyboard: true
  };
}

// ============================================================
// 🃏 DECK
// ============================================================

function deckKeyboard() {
  return {
    keyboard: [
      [
        { text: 'Переименовать 📝' }
      ],
      [
        { text: 'Автосбор 🔄' }
      ],
      [
        { text: 'Собрать колоду 🆕' }
      ],
      [
        { text: '❌ Удалить колоду' }
      ],
      [
        { text: 'Назад 🔙' }
      ]
    ],
    resize_keyboard: true
  };
}

// ============================================================
// 🎴 MY DECK
// ============================================================

function myDeckKeyboard() {
  return {
    keyboard: [
      [
        { text: '🎴 Выбрать карты' }
      ],
      [
        { text: '🗑 Очистить колоду' }
      ],
      [
        { text: '◀️ Назад' }
      ]
    ],
    resize_keyboard: true
  };
}

// ============================================================
// 🎖 ACHIEVEMENTS
// ============================================================

function achievementKeyboard(page = 1, totalPages = 1) {
  return {
    keyboard: [
      [
        { text: '⬅️' },
        { text: `${page}/${totalPages}` },
        { text: '➡️' }
      ],
      [
        { text: 'Назад' }
      ]
    ],
    resize_keyboard: true
  };
}

// ============================================================
// 📤 SEND MESSAGE
// ============================================================

function send(chatId, text, keyboard) {
  return bot.sendMessage(chatId, text, {
    reply_markup: keyboard
  });
}

// ============================================================
// 🚀 START
// ============================================================

bot.onText(/^\/start$/, (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  sessions.set(userId, {
    screen: 'main'
  });

  send(
    chatId,
    `🌑 ECLIPSEDPLAYBOT\n\n` +
    `Добро пожаловать, ${usernameOf(msg)}!\n\n` +
    `Выберите нужный раздел ниже.`,
    mainKeyboard()
  );
});

// ============================================================
// ☰ /menu
// ============================================================

bot.onText(/^\/menu$/, (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  sessions.set(userId, {
    screen: 'menu'
  });

  send(
    chatId,
    '☰ МЕНЮ',
    menuKeyboard(userId)
  );
});

// ============================================================
// 🧭 MAIN MESSAGE ROUTER
// ============================================================

bot.on('message', async (msg) => {
  if (!msg.text) {
    return;
  }

  // Команды обрабатываются через bot.onText.
  if (msg.text.startsWith('/')) {
    return;
  }

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  // ==========================================================
  // ⚔️ NORMAL CARD SPIN
  // ==========================================================

  if (text === '⚔️ Получить карту') {
    sessions.set(userId, {
      screen: 'normal_spin'
    });

    return send(
      chatId,
      `⚔️ ПОЛУЧИТЬ КАРТУ\n\n` +
      `Обычная крутка.\n\n` +
      `🎴 Визуальный экран готов.\n` +
      `Реальную механику крутки подключим позже.`,
      backKeyboard()
    );
  }

  // ==========================================================
  // 🍀 LIMITED CARD SPIN
  // ==========================================================

  if (text === '🍀 Получить карту') {
    sessions.set(userId, {
      screen: 'limited_spin'
    });

    return send(
      chatId,
      `🍀 ПОЛУЧИТЬ КАРТУ\n\n` +
      `Лимитная крутка.\n\n` +
      `🎴 Визуальный экран готов.\n` +
      `Реальную механику лимитной крутки подключим позже.`,
      backKeyboard()
    );
  }

  // ==========================================================
  // 🎴 MY CARDS
  // ==========================================================

  if (text === '🎴 Мои карты') {
    return showCards(chatId, userId);
  }

  // ==========================================================
  // ⚜️ BATTLE
  // ==========================================================

  if (text === '⚜️ Сражение') {
    sessions.set(userId, {
      screen: 'battle'
    });

    return send(
      chatId,
      `⚜️ СРАЖЕНИЕ\n\n` +
      `Выберите нужный режим.`,
      battleKeyboard()
    );
  }

  // ==========================================================
  // 🔱 ARENA
  // ==========================================================

  if (text === '🔱 Арена') {
    return send(
      chatId,
      `🔱 АРЕНА\n\n` +
      `Визуальный раздел Арены подготовлен.\n\n` +
      `⚔️ Реальная механика будет подключена позже.`,
      battleKeyboard()
    );
  }

  // ==========================================================
  // 🏰 TOWER
  // ==========================================================

  if (text === '🏰 Башня') {
    return send(
      chatId,
      `🏰 БАШНЯ\n\n` +
      `🏰 Этаж — 0\n` +
      `⚔️ Попытки — 0\n\n` +
      `Визуальный раздел Башни подготовлен.\n` +
      `Реальная механика будет подключена позже.`,
      battleKeyboard()
    );
  }

  // ==========================================================
  // 👤 PROFILE
  // ==========================================================

  if (text === '👤 Профиль') {
    return showProfile(chatId, userId, msg);
  }

  // ==========================================================
  // ⚜️ CUSTOMIZATION
  // ==========================================================

  if (text === '⚜️ Кастомизация') {
    return showCustomization(chatId, userId);
  }

  // ==========================================================
  // 🛡️ CLAN
  // ==========================================================

  if (text === '🛡️ Клан') {
    sessions.set(userId, {
      screen: 'clan'
    });

    return send(
      chatId,
      `🛡️ КЛАН\n\n` +
      `Визуальный раздел клановой системы подготовлен.\n\n` +
      `Здесь позже появятся наши согласованные механики кланов.`,
      backKeyboard()
    );
  }

  // ==========================================================
  // 🧧 SHOP
  // ==========================================================

  if (text === '🧧 Магазин') {
    sessions.set(userId, {
      screen: 'shop'
    });

    return send(
      chatId,
      `🧧 МАГАЗИН\n\n` +
      `Визуальный раздел магазина подготовлен.\n\n` +
      `Реальные товары и экономика подключаются позже.`,
      backKeyboard()
    );
  }

  // ==========================================================
  // ☰ MENU
  // ==========================================================

  if (text === '☰ Меню') {
    sessions.set(userId, {
      screen: 'menu'
    });

    return send(
      chatId,
      '☰ МЕНЮ',
      menuKeyboard(userId)
    );
  }

  // ==========================================================
  // 🏆 RANKS
  // ==========================================================

  if (text === '🏆 Ранги') {
    sessions.set(userId, {
      screen: 'ranks'
    });

    return send(
      chatId,
      `🏆 РАНГИ\n\n` +
      `🏆 Текущий ранг — Бронза\n` +
      `⭐ Очки — 0\n\n` +
      `Визуальная часть готова.`,
      menuKeyboard(userId)
    );
  }

  // ==========================================================
  // 📜 TITLES
  // ==========================================================

  if (text === '📜 Титулы') {
    return showTitles(chatId, userId);
  }

  // ==========================================================
  // 🎖 ACHIEVEMENTS
  // ==========================================================

  if (text === '🎖 Достижения') {
    return showAchievements(chatId, userId, 1);
  }

  // ==========================================================
  // ❤️ ADMIN PANEL
  // ==========================================================

  if (text === '❤️ Админ панель') {
    if (!isAdmin(userId)) {
      return send(
        chatId,
        '❌ Доступ запрещён.',
        mainKeyboard()
      );
    }

    sessions.set(userId, {
      screen: 'admin'
    });

    return send(
      chatId,
      `❤️ АДМИН ПАНЕЛЬ\n\n` +
      `🔐 Доступ подтверждён.\n\n` +
      `Eclipsed Team\n\n` +
      `Визуальный раздел админ-панели готов.\n` +
      `Функциональность будет подключаться отдельно.`,
      backKeyboard()
    );
  }

  // ==========================================================
  // 💼 MY DECKS
  // ==========================================================

  if (text === '💼 Мои колоды') {
    return showDecks(chatId, userId);
  }

  // ==========================================================
  // ➕ ADD DECK
  // ==========================================================

  if (text === '➕ Добавить колоду') {
    return startDeckCreation(chatId, userId);
  }

  // ==========================================================
  // 🚫 CANCEL DECK CREATION
  // ==========================================================

  if (text === '🚫 Отмена') {
    return showDecks(chatId, userId);
  }

  // ==========================================================
  // 📝 RENAME
  // ==========================================================

  if (text === 'Переименовать 📝') {
    sessions.set(userId, {
      screen: 'deck_rename'
    });

    return send(
      chatId,
      `💬 Введите новое название для колоды`,
      deckCreateKeyboard()
    );
  }

  // ==========================================================
  // 🔄 AUTO COLLECT
  // ==========================================================

  if (text === 'Автосбор 🔄') {
    return send(
      chatId,
      `🔄 АВТОСБОР\n\n` +
      `Автосбор автоматически выберет ` +
      `самые сильные доступные карты.\n\n` +
      `Реальная логика будет подключена позже.`,
      deckKeyboard()
    );
  }

  // ==========================================================
  // 🆕 BUILD DECK
  // ==========================================================

  if (text === 'Собрать колоду 🆕') {
    return showMyDeck(chatId, userId);
  }

  // ==========================================================
  // ❌ DELETE DECK
  // ==========================================================

  if (text === '❌ Удалить колоду') {
    return send(
      chatId,
      `❌ УДАЛЕНИЕ КОЛОДЫ\n\n` +
      `Визуальная заглушка.\n` +
      `Реальное удаление подключим позже.`,
      deckKeyboard()
    );
  }

  // ==========================================================
  // 🎴 SELECT CARDS
  // ==========================================================

  if (text === '🎴 Выбрать карты') {
    return showCards(chatId, userId);
  }

  // ==========================================================
  // 🗑 CLEAR DECK
  // ==========================================================

  if (text === '🗑 Очистить колоду') {
    return showMyDeck(chatId, userId);
  }

  // ==========================================================
  // 💼 EXISTING DECK
  // ==========================================================

  if (text.startsWith('💼 ') && text.includes(' | 0')) {
    const deckName = text
      .replace(/^💼 /, '')
      .replace(/ \| 0$/, '');

    return showDeck(chatId, userId, deckName);
  }

  // ==========================================================
  // 🎖 PAGINATION
  // ==========================================================

  if (text === '⬅️') {
    const session = sessions.get(userId);

    if (session?.screen === 'achievements') {
      const page = Math.max(1, (session.page || 1) - 1);

      return showAchievements(
        chatId,
        userId,
        page
      );
    }

    return;
  }

  if (text === '➡️') {
    const session = sessions.get(userId);

    if (session?.screen === 'achievements') {
      const totalPages = 1;
      const page = Math.min(
        totalPages,
        (session.page || 1) + 1
      );

      return showAchievements(
        chatId,
        userId,
        page
      );
    }

    return;
  }

  // ==========================================================
  // 🔙 BACK BUTTONS
  // ==========================================================

  if (
    text === 'Назад' ||
    text === '◀️ Назад' ||
    text === 'Назад 🔙'
  ) {
    return handleBack(chatId, userId);
  }

  // ==========================================================
  // 💬 TEXT INPUT
  //
  // Название новой колоды.
  // ==========================================================

  const session = sessions.get(userId);

  if (
    session?.screen === 'deck_create' &&
    text.trim().length > 0
  ) {
    const deckName = text.trim();

    session.deckName = deckName;
    session.screen = 'decks';
    session.hasDeck = true;

    return showDecks(
      chatId,
      userId,
      deckName
    );
  }

  // ==========================================================
  // 📝 RENAME INPUT
  // ==========================================================

  if (
    session?.screen === 'deck_rename' &&
    text.trim().length > 0
  ) {
    const newName = text.trim();

    session.deckName = newName;
    session.screen = 'deck';

    return showDeck(
      chatId,
      userId,
      newName
    );
  }
});

// ============================================================
// 🎴 SHOW CARDS
// ============================================================

function showCards(chatId, userId) {
  sessions.set(userId, {
    screen: 'cards'
  });

  return send(
    chatId,
    `🎴 МОИ КАРТЫ\n\n` +

    `Выберите нужные фильтры для карт.\n\n` +

    `Тип карт — Боевые ⚔️\n` +
    `Название карты — ✖️\n` +
    `Вселенные — ✖️\n` +
    `Редкости — ✖️\n` +
    `Стихии — ✖️\n` +
    `Вывести только лимитированные ☘️ — ☑️\n\n` +

    `Сортировка:\n` +
    `Сначала — Высокий рейтинг вперёд\n` +
    `Потом — Новые вперёд\n\n` +

    `🔍 Найдено карт — 0`,
    cardsKeyboard()
  );
}

// ============================================================
// 📜 TITLES
// ============================================================

function showTitles(chatId, userId) {
  sessions.set(userId, {
    screen: 'titles'
  });

  return send(
    chatId,
    `📜 ТИТУЛЫ\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `👑 Активный титул:\n` +
    `Не выбран\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `🏅 ДОСТУПНЫЕ ТИТУЛЫ\n\n` +

    `🔒 Страж заточения\n` +
    `🔒 Освободитель\n` +
    `🔒 Грань мастерства\n` +
    `🔒 Нулевой владыка\n` +
    `🔒 Избранник небес\n` +
    `🔒 Тот, кто остановил время`,
    backKeyboard()
  );
}

// ============================================================
// 🎖 ACHIEVEMENTS
// ============================================================

function showAchievements(chatId, userId, page = 1) {
  const totalPages = 1;

  sessions.set(userId, {
    screen: 'achievements',
    page
  });

  return send(
    chatId,
    `🎖 ДОСТИЖЕНИЯ\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `🏆 Достижение #1\n` +
    `🔒 Не выполнено\n` +
    `📝 Описание достижения\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `🏆 Достижение #2\n` +
    `🔒 Не выполнено\n` +
    `📝 Описание достижения\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `🏆 Достижение #3\n` +
    `🔒 Не выполнено\n` +
    `📝 Описание достижения`,
    achievementKeyboard(
      page,
      totalPages
    )
  );
}

// ============================================================
// 👤 PROFILE
// ============================================================

function showProfile(chatId, userId, msg) {
  sessions.set(userId, {
    screen: 'profile'
  });

  return send(
    chatId,

    `👤 ПРОФИЛЬ (${usernameOf(msg)})\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `📜 Титул\n` +
    `Не выбран\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `💠 Осколки — 0\n` +
    `✨ Звёзды — 0\n` +
    `🪙 Коины — 0\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `🎴 Карты — 0\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `Победа/ничья/поражение:\n` +
    `0/0/0\n\n` +

    `🏆 Ранг — Бронза\n` +
    `🏰 Башня — 0 этаж`,

    {
      keyboard: [
        [
          { text: '⚜️ Кастомизация' }
        ],
        [
          { text: '🎴 Мои карты' }
        ]
      ],
      resize_keyboard: true
    }
  );
}

// ============================================================
// ⚜️ CUSTOMIZATION
// ============================================================

function showCustomization(chatId, userId) {
  sessions.set(userId, {
    screen: 'customization'
  });

  return send(
    chatId,
    `⚜️ КАСТОМИЗАЦИЯ`,
    customizationKeyboard(userId)
  );
}

// ============================================================
// 💼 DECK LIST
// ============================================================

function showDecks(
  chatId,
  userId,
  deckName = null
) {
  const session = sessions.get(userId) || {};

  sessions.set(userId, {
    screen: 'decks',
    hasDeck: Boolean(deckName || session.hasDeck),
    deckName: deckName || session.deckName || null
  });

  const currentDeckName =
    deckName ||
    session.deckName ||
    null;

  return send(
    chatId,

    `💼 СПИСОК ВАШИХ КОЛОД\n\n` +

    `Вы можете создать только 2 колоды.\n\n` +

    `Нажмите на кнопку «Выбрать», ` +
    `чтобы использовать колоду в боях.` +

    (
      currentDeckName
        ? `\n\n💼 ${currentDeckName} | 0`
        : ''
    ),

    deckListKeyboard(
      Boolean(currentDeckName),
      currentDeckName
    )
  );
}

// ============================================================
// ➕ CREATE DECK
// ============================================================

function startDeckCreation(chatId, userId) {
  sessions.set(userId, {
    screen: 'deck_create'
  });

  return send(
    chatId,
    `💬 Введите название для колоды`,
    deckCreateKeyboard()
  );
}

// ============================================================
// 🃏 DECK DETAILS
// ============================================================

function showDeck(
  chatId,
  userId,
  deckName
) {
  sessions.set(userId, {
    screen: 'deck',
    deckName
  });

  return send(
    chatId,

    `🃏 Колода — ${deckName}\n\n` +

    `Рейтинг колоды — 0\n\n` +

    `Количество карт — 0 ⚠️ недостаточно карт для игры\n\n` +

    `Редкости:\n` +
    `✖️\n\n` +

    `Добавьте карты в колоду в списке ваших карт ` +
    `или нажмите на кнопку автосбора.\n\n` +

    `Дата создания — «08 августа 2026»`,

    deckKeyboard()
  );
}

// ============================================================
// 🎴 MY DECK
// ============================================================

function showMyDeck(
  chatId,
  userId
) {
  const session = sessions.get(userId) || {};
  const deckName = session.deckName || 'Название колоды';

  sessions.set(userId, {
    screen: 'my_deck',
    deckName
  });

  return send(
    chatId,

    `🎴 МОЯ КОЛОДА\n\n` +

    `⚔️ Состав: 0/6\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `1️⃣ 🔒 Пусто\n` +
    `2️⃣ 🔒 Пусто\n` +
    `3️⃣ 🔒 Пусто\n` +
    `4️⃣ 🔒 Пусто\n` +
    `5️⃣ 🔒 Пусто\n` +
    `6️⃣ 🔒 Пусто\n\n` +

    `━━━━━━━━━━━━━━`,

    myDeckKeyboard()
  );
}

// ============================================================
// 🔙 BACK NAVIGATION
// ============================================================

function handleBack(
  chatId,
  userId
) {
  const session = sessions.get(userId) || {};
  const screen = session.screen;

  // ----------------------------------------------------------
  // Customization → Profile
  // ----------------------------------------------------------

  if (screen === 'customization') {
    return sendProfile(
      chatId,
      userId
    );
  }

  // ----------------------------------------------------------
  // Profile → Main
  // ----------------------------------------------------------

  if (screen === 'profile') {
    return send(
      chatId,
      '🌑 ECLIPSEDPLAYBOT',
      mainKeyboard()
    );
  }

  // ----------------------------------------------------------
  // Titles → Menu
  // ----------------------------------------------------------

  if (screen === 'titles') {
    return send(
      chatId,
      '☰ МЕНЮ',
      menuKeyboard(userId)
    );
  }

  // ----------------------------------------------------------
  // Achievements → Menu
  // ----------------------------------------------------------

  if (screen === 'achievements') {
    return send(
      chatId,
      '☰ МЕНЮ',
      menuKeyboard(userId)
    );
  }

  // ----------------------------------------------------------
  // Cards → Main
  // ----------------------------------------------------------

  if (screen === 'cards') {
    return send(
      chatId,
      '🌑 ECLIPSEDPLAYBOT',
      mainKeyboard()
    );
  }

  // ----------------------------------------------------------
  // Decks → Cards
  // ----------------------------------------------------------

  if (screen === 'decks') {
    return showCards(
      chatId,
      userId
    );
  }

  // ----------------------------------------------------------
  // Deck → Decks
  // ----------------------------------------------------------

  if (screen === 'deck') {
    const deckName =
      session.deckName || null;

    return showDecks(
      chatId,
      userId,
      deckName
    );
  }

  // ----------------------------------------------------------
  // My Deck → Deck
  // ----------------------------------------------------------

  if (screen === 'my_deck') {
    return showDeck(
      chatId,
      userId,
      session.deckName || 'Название колоды'
    );
  }

  // ----------------------------------------------------------
  // Battle → Main
  // ----------------------------------------------------------

  if (screen === 'battle') {
    return send(
      chatId,
      '🌑 ECLIPSEDPLAYBOT',
      mainKeyboard()
    );
  }

  // ----------------------------------------------------------
  // Menu → Main
  // ----------------------------------------------------------

  if (screen === 'menu') {
    return send(
      chatId,
      '🌑 ECLIPSEDPLAYBOT',
      mainKeyboard()
    );
  }

  // ----------------------------------------------------------
  // Admin → Main
  // ----------------------------------------------------------

  if (screen === 'admin') {
    return send(
      chatId,
      '🌑 ECLIPSEDPLAYBOT',
      mainKeyboard()
    );
  }

  // ----------------------------------------------------------
  // Default
  // ----------------------------------------------------------

  return send(
    chatId,
    '🌑 ECLIPSEDPLAYBOT',
    mainKeyboard()
  );
}

// ============================================================
// 👤 PROFILE WITHOUT MESSAGE OBJECT
// ============================================================

function sendProfile(
  chatId,
  userId
) {
  sessions.set(userId, {
    screen: 'profile'
  });

  return send(
    chatId,

    `👤 ПРОФИЛЬ\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `📜 Титул\n` +
    `Не выбран\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `💠 Осколки — 0\n` +
    `✨ Звёзды — 0\n` +
    `🪙 Коины — 0\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `🎴 Карты — 0\n\n` +

    `━━━━━━━━━━━━━━\n\n` +

    `Победа/ничья/поражение:\n` +
    `0/0/0\n\n` +

    `🏆 Ранг — Бронза\n` +
    `🏰 Башня — 0 этаж`,

    {
      keyboard: [
        [
          { text: '⚜️ Кастомизация' }
        ],
        [
          { text: '🎴 Мои карты' }
        ]
      ],
      resize_keyboard: true
    }
  );
}

// ============================================================
// 📦 EXPORT
// ============================================================

module.exports = {
  bot,
  isAdmin
};

// ============================================================
// 📋 STARTUP LOG
// ============================================================

console.log('=================================');
console.log('🌑 ECLIPSEDPLAYBOT');
console.log('🎨 Visual UI: READY');
console.log('🎴 Cards: READY');
console.log('💼 Decks: READY');
console.log('⚜️ Battle: READY');
console.log('👤 Profile: READY');
console.log('⚜️ Customization: READY');
console.log('📜 Titles: READY');
console.log('🎖 Achievements: READY');
console.log('🛡️ Clan UI: READY');
console.log('🧧 Shop UI: READY');
console.log('❤️ Admin access control: READY');
console.log('👥 Eclipsed Team');
console.log('=================================');