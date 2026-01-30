const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const WS_URL = "wss://mempool.space/api/v1/ws";
const DATA_FILE = path.join(__dirname, "data.jsonl"); // JSON Lines

let socket;
let reconnectTimeout = null;

function connect() {
    console.log("create");
    socket = new WebSocket(WS_URL);

    socket.on("open", () => {
        console.log("open");

        socket.send(
            JSON.stringify({
                action: "want",
                data: ["blocks", "stats", "mempool-blocks", "live-10h-chart"],
            })
        );
    });

    socket.on("message", (data) => {
        try {
            const text = data.toString();
            const parsed = JSON.parse(text);

            console.log("message dta:", parsed);


            fs.appendFile(
                DATA_FILE,
                text + "\n",
                (err) => {
                    if (err) {
                        console.error(" append error:", err);
                    }
                }
            );
        } catch (err) {
            console.error(" parse message", err);
        }
    });

    socket.on("close", (code, reason) => {
        console.log(
            `code=${code} reason=${reason.toString()}`
        );

        scheduleReconnect();
    });

    socket.on("error", (error) => {
        console.error("WebSocket error", error);
        socket.close();
    });
}

function scheduleReconnect() {
    if (reconnectTimeout) return;

    console.log("reconnecting");
    reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        connect();
    }, 3000);
}


connect();