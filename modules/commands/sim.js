module.exports.config = {
  name: "goibot",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "LunarKrystal",
  description: "Trò chuyện với bot qua API khi nhắc đến 'bot' hoặc phản hồi",
  commandCategory: "Tiện ích",
  usages: "[tin nhắn chứa bot hoặc phản hồi tin nhắn của bot]",
  cooldowns: 2,
};

const { get } = require("axios");
const API_URL = "https://nguyenmanh.name.vn/api/sim"; // Thay đổi nếu cần
const API_KEY = "Ky5jfsLB"; // Thay bằng API key hợp lệ

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body, senderID, messageReply } = event;

  // Nếu không có nội dung tin nhắn, thoát
  if (!body) return;

  // Kiểm tra nếu tin nhắn chứa từ "bot" hoặc là phản hồi của bot
  const isReplyToBot = messageReply && messageReply.senderID === api.getCurrentUserID();
  if (body.toLowerCase().indexOf("bot") !== -1 || body.toLowerCase().indexOf("Bot") !== -1 || isReplyToBot) {
    try {
      // Xác định nội dung cần gửi đến API
      const query = isReplyToBot ? body : `${body}`;
      const response = await get(`${API_URL}?type=ask&ask=${encodeURIComponent(query)}&apikey=${API_KEY}`);
      const reply = response.data.answer || "Bot không hiểu bạn nói gì.";
      return api.sendMessage(reply, threadID, messageID);
    } catch (error) {
      return api.sendMessage("Có lỗi xảy ra khi gọi API. Vui lòng thử lại sau.", threadID, messageID);
    }
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  // Gửi câu hỏi từ args đến API
  const question = args.join(" ");
  if (!question) return api.sendMessage("Bạn cần nhập nội dung để bot trả lời.", threadID, messageID);

  try {
    const response = await get(`${API_URL}?type=ask&ask=${encodeURIComponent(question)}&apikey=${API_KEY}`);
    const reply = response.data.answer || "Bot không hiểu bạn nói gì.";
    return api.sendMessage(reply, threadID, messageID);
  } catch (error) {
    return api.sendMessage("Có lỗi xảy ra khi gọi API. Vui lòng thử lại sau.", threadID, messageID);
  }
};
