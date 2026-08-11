const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');


// ===============================
// ENV
// ===============================

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID || 0);

if (!TOKEN) {
    console.error("❌ BOT_TOKEN отсутствует в Environment");
    process.exit(1);
}


// ===============================
// BOT
// ===============================

const bot = new TelegramBot(TOKEN, {
    polling: true
});

console.log("🌑 EclipsedPlayBot started");


// ===============================
// ADMIN CHECK
// ===============================

function isAdmin(id) {
    return id === ADMIN_ID;
}


// ===============================
// START COMMAND
// ===============================

bot.onText(/\/start/, async (msg) => {

    const chatId = msg.chat.id;


    const keyboard = {

        reply_markup: {

            keyboard: [

                [
                    {
                        text: "⚔️ Получить карту"
                    },
                    {
                        text: "🍀 Получить карту"
                    }
                ],

                [
                    {
                        text: "🎴 Мои карты"
                    }
                ],

                [
                    {
                        text: "⚜️ Сражение"
                    },
                    {
                        text: "👤 Профиль"
                    },
                    {
                        text: "🛡️ Клан"
                    }
                ],

                [
                    {
                        text: "🧧 Магазин"
                    },
                    {
                        text: "☰ Меню"
                    }
                ]

            ],

            resize_keyboard: true
        }
    };


    const image = path.join(
        __dirname,
        "assets",
        "Welcome.png"
    );


    try {

        if(fs.existsSync(image)) {

            await bot.sendPhoto(
                chatId,
                image,
                {
                    caption:
                    "🌑 Добро пожаловать Eclipse!

⚔️ Сражайся на арене, обменивайся картами, ищи друзей, и развивайтесь вместе ✨",
                    ...keyboard
                }
            );

        } else {

            await bot.sendMessage(
                chatId,
                "🌑 Добро пожаловать Eclipse!

⚔️ Сражайся на арене, обменивайся картами, ищи друзей, и развивайтесь вместе ✨",
                keyboard
            );

        }


    } catch(error){

        console.error(
            "START ERROR:",
            error.message
        );

    }


});


// ===============================
// INLINE MENU HANDLER
// ===============================


bot.on(
'message',
async(msg)=>{


    const chatId = msg.chat.id;
    const text = msg.text;


    if(text === "👤 Профиль") {


        await bot.sendMessage(
            chatId,
            "👤 Профиль игрока",
            {

                reply_markup:{

                    inline_keyboard:[

                        [
                            {
                                text:"🎴 Мои карты",
                                callback_data:"cards"
                            }
                        ],

                        [
                            {
                                text:"⚜️ Кастомизация",
                                callback_data:"custom"
                            }
                        ]

                    ]

                }

            }
        );


    }



    if(text === "☰ Меню"){


        await bot.sendMessage(
            chatId,
            "☰ Меню",

            {

            reply_markup:{

                inline_keyboard:[

                    [
                        {
                            text:"🏆 Ранги",
                            callback_data:"ranks"
                        }
                    ],

                    [
                        {
                            text:"📜 Титулы",
                            callback_data:"titles"
                        }
                    ],

                    [
                        {
                            text:"🎖 Достижения",
                            callback_data:"achievements"
                        }
                    ]

                ]

            }

            }

        );


    }



    if(text === "⚜️ Сражение"){


        await bot.sendMessage(
            chatId,
            "⚜️ Сражение",

            {

            reply_markup:{

                inline_keyboard:[

                    [
                        {
                            text:"🔱 Арена",
                            callback_data:"arena"
                        },

                        {
                            text:"🏰 Башня",
                            callback_data:"tower"
                        }

                    ]

                ]

            }

            }

        );

    }


});


// ===============================
// CALLBACKS
// ===============================


bot.on(
'callback_query',
async(query)=>{


const chatId=query.message.chat.id;


switch(query.data){


case "cards":

await bot.sendMessage(
chatId,
"🎴 Ваши карты\n\nПока коллекция пустая"
);

break;



case "custom":

let buttons=[

[
{
text:"📜 Титулы",
callback_data:"titles"
}
],

[
{
text:"🎖 Достижения",
callback_data:"achievements"
}
]

];


// скрытая админка

if(isAdmin(chatId)){

buttons.push(

[
{
text:"❤️ Админ панель",
callback_data:"admin"
}
]

);

}


buttons.push(

[
{
text:"(Назад)",
callback_data:"back"
}
]

);


await bot.sendMessage(
chatId,
"⚜️ Кастомизация",
{

reply_markup:{
inline_keyboard:buttons
}

}

);


break;



case "admin":


await bot.sendMessage(
chatId,
"❤️ Админ панель\n\nДоступ разрешен"
);


break;



case "titles":


await bot.sendMessage(
chatId,
"📜 Титулы\n\nПока список пуст"
);


break;



case "achievements":


await bot.sendMessage(
chatId,
"🎖 Достижения\n\nСтраница 1/1",

{

reply_markup:{

inline_keyboard:[

[
{
text:"⬅️",
callback_data:"prev"
},

{
text:"1/1",
callback_data:"page"
},

{
text:"➡️",
callback_data:"next"
}

],

[
{
text:"(Назад)",
callback_data:"menu"
}

]

]

}

}

);


break;



case "menu":

await bot.sendMessage(
chatId,
"☰ Меню"
);

break;


}


});


// ===============================
// EXPORT
// ===============================


module.exports = {
    bot,
    isAdmin
};