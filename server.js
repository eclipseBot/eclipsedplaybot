const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());


// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "EclipsedPlayBot by Eclipsed Team is running",
        service: "EclipsedPlayBot",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    });
});


// ==========================================
// ROOT
// ==========================================

app.get("/", (req, res) => {
    res.json({
        message: "EclipsedPlayBot by Eclipsed Team",
        status: "Running",
        endpoints: {
            health: "/health",
            status: "/status"
        }
    });
});


// ==========================================
// STATUS
// ==========================================

app.get("/status", (req, res) => {

    res.json({

        bot: {
            name: "EclipsedPlayBot",
            team: "Eclipsed Team",
            version: "1.0.0",
            status: "Online"
        },

        server: {
            node: process.version,
            uptime: Math.floor(process.uptime()) + " seconds",
            memory:
                Math.round(
                    process.memoryUsage().heapUsed / 1024 / 1024
                ) + " MB"
        }

    });

});


// ==========================================
// START SERVER
// ==========================================

const server = app.listen(PORT, "0.0.0.0", function () {

    console.log("==============================");
    console.log("ECLIPSEDPLAYBOT");
    console.log("Eclipsed Team");
    console.log("Server started successfully!");
    console.log("Port: " + PORT);
    console.log("Environment: " + (process.env.NODE_ENV || "development"));
    console.log("Started: " + new Date().toISOString());
    console.log("==============================");


    startBot();

});


// ==========================================
// BOT LOADER
// ==========================================

function startBot() {

    try {

        console.log("Loading bot...");

        const bot = require("./bot");


        if (bot && bot.bot) {

            console.log("Bot loaded successfully!");
            console.log("Systems ready");

        } else {

            console.log("Bot file loaded without export");

        }


    } catch (error) {

        console.log("Bot loading error:");
        console.log(error.message);

    }

}



// ==========================================
// SHUTDOWN
// ==========================================

function shutdown(signal) {

    console.log("");
    console.log("Shutdown signal received: " + signal);


    server.close(function () {

        console.log("Server closed");

        process.exit(0);

    });

}


process.on("SIGINT", function () {

    shutdown("SIGINT");

});


process.on("SIGTERM", function () {

    shutdown("SIGTERM");

});


module.exports = app;