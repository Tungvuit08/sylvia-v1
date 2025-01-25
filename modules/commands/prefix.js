module.exports.config = {
  name: "prefix",
  version: "2.0.1",
  hasPermssion: 0,
  credits: "Krystal & LunarTeam",
  description: "sos",
  commandCategory: "Tiện ích",
  usages: "Nhập prefix|pre để xem prefix bot",
  cooldowns: 0
};
module.exports.languages = {
  "vi": {},
  "en": {}
};

function random(arr) {
  var rd = arr[Math.floor(Math.random() * arr.length)];
  return rd;
}

async function sendPrefixInfo(api, event, Threads, prefix, time, day) {
  const threadName = (await Threads.getInfo(event.threadID)).threadName || "Unknown";
  api.sendMessage({
    body: `====『 𝗣𝗥𝗘𝗙𝗜𝗫 』====\n━━━━━━━━━━━━━━━━\n『❗』➝ 𝗣𝗿𝗲𝗳𝗶𝘅 𝗰𝘂̉𝗮 𝗯𝗼𝘅 ${threadName} 𝗹𝗮̀: ${prefix}\n『🔎』➝ 𝗣𝗿𝗲𝗳𝗶𝘅 𝗰𝘂̉𝗮 𝗵𝗲̣̂ 𝘁𝗵𝗼̂́𝗻𝗴 𝗹𝗮̀: ${global.config.PREFIX}\n『📌』➝ 𝗧𝗲̂𝗻 𝗯𝗼𝘁: ${global.config.BOTNAME}\n『🗃』➝ 𝗛𝗶𝗲̣̂𝗻 𝘁𝗮̣𝗶 𝗯𝗼𝘁 đ𝗮𝗻𝗴 𝗰𝗼́ ${client.commands.size} 𝗹𝗲̣̂𝗻𝗵 𝗰𝗼́ 𝘁𝗵𝗲̂̉ 𝘀𝘂̛̉ 𝗱𝘂̣𝗻𝗴\n『📌』➝ 𝗧𝗜𝗗 𝗯𝗼𝘅: ${event.threadID}\n『⏰』➝ 𝗕𝗮̂𝘆 𝗚𝗶𝗼̛̀ 𝗟𝗮̀: ${time} || ${day}`,
    attachment: global.includes.splice(0, 1)
  }, event.threadID, event.messageID);
}

module.exports.handleEvent = async function ({ api, event, Threads }) {
  const tim = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:ss");
  var thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
  if (thu == 'Sunday') thu = '𝐂𝐡𝐮̉ 𝐍𝐡𝐚̣̂𝐭';
  if (thu == 'Monday') thu = '𝐓𝐡𝐮̛́ 𝐇𝐚𝐢';
  if (thu == 'Tuesday') thu = '𝐓𝐡𝐮̛́ 𝐁𝐚';
  if (thu == 'Wednesday') thu = '𝐓𝐡𝐮̛́ 𝐓𝐮̛';
  if (thu == "Thursday") thu = '𝐓𝐡𝐮̛́ 𝐍𝐚̆𝐦';
  if (thu == 'Friday') thu = '𝐓𝐡𝐮̛́ 𝐒𝐚́𝐮';
  if (thu == 'Saturday') thu = '𝐓𝐡𝐮̛́ 𝐁𝐚̉𝐲';

  var { threadID, messageID, body } = event, { PREFIX } = global.config;
  let threadSetting = global.data.threadData.get(threadID) || {};
  let prefix = threadSetting.PREFIX || PREFIX;

  if (["prefix", "Prefix", "Pre", "pre"].includes(body.toLowerCase())) {
    sendPrefixInfo(api, event, Threads, prefix, tim, thu);
  }
};

module.exports.handleReaction = async function ({ api, event, Threads, handleReaction, getText }) {
  try {
    if (event.userID != handleReaction.author) return;
    const { threadID, messageID } = event;
    var data = (await Threads.getData(String(threadID))).data || {};
    data["PREFIX"] = handleReaction.PREFIX;
    await Threads.setData(threadID, { data });
    await global.data.threadData.set(String(threadID), data);
    api.unsendMessage(handleReaction.messageID);
    return api.sendMessage(`đã đổi prefix của nhóm thành: ${handleReaction.PREFIX}`, threadID, messageID);
  } catch (e) { return console.log(e); }
};

module.exports.run = async ({ api, event, args, Threads }) => {
  if (typeof args[0] == "undefined") return api.sendMessage("bạn phải nhập prefix cần thay đổi", event.threadID, event.messageID);
  let prefix = args[0].trim();
  if (!prefix) return api.sendMessage("bạn phải nhập prefix cần thay đổi", event.threadID, event.messageID);
  if (prefix == "reset") {
    var data = (await Threads.getData(event.threadID)).data || {};
    data["PREFIX"] = global.config.PREFIX;
    await Threads.setData(event.threadID, { data });
    await global.data.threadData.set(String(event.threadID), data);
    return api.sendMessage(`đã reset prefix thành: ${global.config.PREFIX}`, event.threadID, event.messageID);
  } else {
    return api.sendMessage(`bạn có chắc muốn đổi prefix của nhóm thành: ${prefix}\n👉 thả cảm xúc vào tin nhắn này để xác nhận`, event.threadID, (error, info) => {
      global.client.handleReaction.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        PREFIX: prefix
      });
    });
  }
};
