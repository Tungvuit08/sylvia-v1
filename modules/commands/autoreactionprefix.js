const fs = require("fs");

module.exports.config = {
    name: "autoreactionprefix",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Krsytal", 
    description: "No Prefix",
    commandCategory: "Noprefix",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
    var { threadID, messageID } = event;

    // Kiểm tra nếu chuỗi bắt đầu bằng PREFIX
    if (event.body.indexOf(`${global.config.PREFIX}`) === 0) {
        var msg = {
            body: ""
        };
        api.sendMessage(msg, threadID, messageID);
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
    }
};

module.exports.run = function({ api, event, client, __GLOBAL }) {};
