module.exports.config = {
    name: "anhvip",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "LunarTeam",
    description: "gửi ảnh theo keyword",
    commandCategory: "Media",
    usages: "[keyword]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const axios = require("axios");
    const fs = require("fs");
    const path = require("path");

    // Define API URL
    const API_URL = "https://imgs-api.vercel.app/"; // Base URL for the API
    const API_KEY = "mk001"; // API key

    // Define the menu
    const keywords = {
        "girl": "Ảnh gái xinh.",
        "du": "Ảnh dú.",
        "mong": "Ảnh mông.",
        "capdoi": "Ảnh cặp đôi.",
        "gainhat": "Ảnh gái nhật.",
        "hana": "Ảnh hana.",
        "ausand": "Ảnh ausand.",
        "jimmy": "Ảnh jimmy.",
        "jack": "Ảnh jack.",
        "khanhuyen": "Ảnh khánh huyền.",
        "lebong": "Ảnh lê bống.",
        "linhngocdam": "Ảnh linh ngọc đàm.",
        "ngoctrinh": "Ảnh ngọc trinh.",
        "naughty": "Ảnh naughty.",
        "japcosplay": "Ảnh japan cosplay.",
        "loli": "Ảnh loli.",
        "caidloli": "Ảnh caid loli.",
        "tw": "Ảnh gái trung quốc.",
        "nsfw": "Ảnh nsfw.",
        "anime": "Ảnh anime.",
        "aqua": "Ảnh aqua.",
        "chitanda": "Ảnh chitanda.",
        "kana": "Ảnh kana.",
        "kurumi": "Ảnh kurumi.",
        "lucy": "Ảnh lucy.",
        "mirai": "Ảnh mirai.",
        "rem": "Ảnh rem.",
        "sagiri": "Ảnh sagiri.",
        "umaru": "Ảnh umaru.",
        "rushia": "Ảnh rushia."
    };

    // If no keyword is provided, display the menu
    if (!args[0]) {
        let menu = "===== 『 MENU KEYWORDS 』 =====\n";
        menu += "\nKEY WORDS\nName\tDescription\n";
        for (const [key, description] of Object.entries(keywords)) {
            menu += `\n${key}\t${description}`;
        }
        menu += "\n\nHãy chọn một từ khóa và nhập lệnh với từ khóa đó.";

        return api.sendMessage(menu, event.threadID, event.messageID);
    }

    // Get keyword from user arguments
    const keyword = args[0];

    // Validate keyword
    if (!keywords[keyword]) {
        return api.sendMessage("❌ Từ khóa không hợp lệ. Hãy nhập lệnh mà không có tham số để xem danh sách từ khóa.", event.threadID, event.messageID);
    }

    try {
        // Construct the API URL for the keyword and API key
        const imageURL = `${API_URL}${keyword}?apikey=${API_KEY}`;

        // Make API call to fetch image
        const response = await axios.get(imageURL);

        const { url, author } = response.data;

        if (!url) {
            api.sendMessage("❌ Không tìm thấy hình ảnh với từ khóa bạn cung cấp.", event.threadID, event.messageID);
            return;
        }

        const ext = path.extname(url); // Extract file extension
        const filePath = path.resolve(__dirname, `cache/character${ext}`);

        // Download image
        const writer = fs.createWriteStream(filePath);
        const imageStream = await axios({
            url: url,
            method: "GET",
            responseType: "stream"
        });
        imageStream.data.pipe(writer);

        writer.on("finish", () => {
            api.sendMessage({
                body: `===== 『 𝐂𝐇𝐀𝐑𝐀𝐂𝐓𝐄𝐑 𝐈𝐌𝐀𝐆𝐄 』 =====\n➢ Từ khóa: ${keyword}\n➢ Tác giả: ${author || "Không rõ"}\n━━━━━━━━━━━━━━━━━`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => {
                fs.unlinkSync(filePath); // Clean up file after sending
            }, event.messageID);
        });

        writer.on("error", (err) => {
            console.error("Error writing image file:", err);
        });

    } catch (error) {
        console.error("Error occurred:", error);
        api.shareContact(`❌ Có lỗi xảy ra khi thực hiện lệnh.\nLiên hệ Admin: ${global.config.AMDIN_NAME} để báo cáo lỗi!`, global.config.NDH[0], event.threadID, event.messageID);
    }
};
