module.exports.config = {
    name: "thongtin",
    version: "0.0.1",
    hasPermssion: 0,
    credits: "L.T.Khôi & LunarTeam",
    description: "",
    commandCategory: "Tiện ích",
    usages: "",
    cooldowns: 0,
    denpendencies: {
        "fs": "",
        "request": ""
    }
};
module.exports.onLoad = () => {
    const fs = require("fs-extra");
    const request = require("request");
    const dirMaterial = __dirname + `/noprefix/`;
    if (!fs.existsSync(dirMaterial + "noprefix")) fs.mkdirSync(dirMaterial, { recursive: true });
    if (!fs.existsSync(dirMaterial + "yl01cj.jpeg")) request("https://files.catbox.moe/yl01cj.jpeg").pipe(fs.createWriteStream(dirMaterial + "yl01cj.jpeg"));
}
module.exports.handleEvent = async ({ event, api, Currencies,Users, args, utils, global, client }) => {
    const fs = require("fs");
    let name = await Users.getNameUser(event.senderID)
    var msg = {
                body: `[💤] Admin: ${global.config.AMDIN_NAME}\n🌺 Chúc bạn ${name} sử dụng ${global.config.BOT_NAME} vui vẻ ❤️`,
                attachment: fs.createReadStream(__dirname + `/noprefix/yl01cj.jpeg`)
            }
    if (event.body.toLowerCase() == "Khôi"){
        return api.sendMessage(msg,event.threadID,event.messageID);}
        };
module.exports.run = async ({ event, api, Currencies, args, utils }) => {
return api.sendMessage(`[💤] Admin: ${global.config.AMDIN_NAME}\n[✔] https://files.catbox.moe/yl01cj.jpeg`,event.threadID)
    }