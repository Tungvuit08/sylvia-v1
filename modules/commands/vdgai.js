module.exports.config = {
  name: 'vdgai',
  version: '1.0.0',
  credits: 'Tiến',
  usePrefix: false,
  hasPermission: 0,
  description: 'Xem video gái tiktok siêu múp',
  commandCategory: 'Media',
  usages: '[]',
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  api.sendMessage({ body: "Bán nhà tui cũng chơi", attachment: global.a.splice(0, 1) }, event.threadID, event.messageID);
};