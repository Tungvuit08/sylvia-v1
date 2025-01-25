const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "autoreact",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "Krsytal",
    description: "No Prefix",
    commandCategory: "Noprefix",
    cooldowns: 5,
};

module.exports.handleEvent = function ({ api, event, client, __GLOBAL }) {
    var { threadID, messageID } = event;

    // Đường dẫn tới tệp JSON
    const filePath = path.join(__dirname, "./data/reactions.json");

    // Nếu tệp không tồn tại, tạo tệp mặc định
    if (!fs.existsSync(filePath)) {
        const defaultReactions = [
            "👍", "❤️", "😂", "😮", "😢", "😡", "✅", 
            "🔥", "✨", "🎉", "💖", "🥳", "😎", "😆", 
            "🤔", "😜", "🙃", "😴", "💯", "🤩", "🎶",
            "👏", "💔", "🌈", "🌟", "🤷", "🫡", "🙏",
            "😇", "😅", "🤗", "😏", "🌸", "🐱", "🦄"
        ];
        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }
        // Ghi tệp JSON
        fs.writeFileSync(filePath, JSON.stringify(defaultReactions, null, 4), "utf8");
        console.log(`Tệp reactions.json đã được tạo tại: ${filePath}`);
    }

    // Đọc danh sách cảm xúc từ tệp JSON
    const reactions = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Random một cảm xúc từ danh sách
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];

    let react = event.body.toLowerCase();

    // Mảng chữ cái tiếng Việt, bao gồm cả chữ hoa và chữ thường
    const vietnameseLetters = ["a", "á", "à", "ả", "ã", "ạ", "ă", "ắ", "ằ", "ẳ", "ẵ", "ặ", "â", "ấ", "ầ", "ẩ", "ẫ", "ậ",
        "b", "c", "d", "đ", "e", "é", "è", "ẻ", "ẽ", "ẹ", "ê", "ế", "ề", "ể", "ễ", "ệ",
        "f", "g", "h", "i", "í", "ì", "ỉ", "ĩ", "ị", "j", "k", "l", "m", "n", "o", "ó", "ò",
        "ỏ", "õ", "ọ", "ô", "ố", "ồ", "ổ", "ỗ", "ộ", "ơ", "ớ", "ờ", "ở", "ỡ", "ợ",
        "p", "q", "r", "s", "t", "u", "ú", "ù", "ủ", "ũ", "ụ", "ư", "ứ", "ừ", "ử",
        "ữ", "ự", "v", "w", "x", "y", "ý", "ỳ", "ỷ", "ỹ", "ỵ", "z",
        // Chữ hoa
        "A", "Á", "À", "Ả", "Ã", "Ạ", "Ă", "Ắ", "Ằ", "Ẳ", "Ẵ", "Ặ", "Â", "Ấ", "Ầ", "Ẩ", "Ẫ", "Ậ",
        "B", "C", "D", "Đ", "E", "É", "È", "Ẻ", "Ẽ", "Ẹ", "Ê", "Ế", "Ề", "Ể", "Ễ", "Ệ",
        "F", "G", "H", "I", "Í", "Ì", "Ỉ", "Ĩ", "Ị", "J", "K", "L", "M", "N", "O", "Ó", "Ò",
        "Ỏ", "Õ", "Ọ", "Ô", "Ố", "Ồ", "Ổ", "Ỗ", "Ộ", "Ơ", "Ớ", "Ờ", "Ở", "Ỡ", "Ợ",
        "P", "Q", "R", "S", "T", "U", "Ú", "Ù", "Ủ", "Ũ", "Ụ", "Ư", "Ứ", "Ừ", "Ử",
        "Ữ", "Ự", "V", "W", "X", "Y", "Ý", "Ỳ", "Ỷ", "Ỹ", "Ỵ", "Z"];

    // Mảng các chữ số từ 0 đến 9
    const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    // Mảng các ký tự đặc biệt
    const specialChars = [",", ".", ";", "'", "/", ":", "!", "?", "~", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "-", "+", "=", "{", "}", "[", "]", "<", ">", "|"];

    // Kiểm tra nếu từ bắt đầu với bất kỳ ký tự nào trong bảng chữ cái tiếng Việt, chữ số hoặc ký tự đặc biệt
    let startsWithVietnameseLetterOrNumberOrSpecialChar = false;

    // Kiểm tra ký tự tiếng Việt
    for (let letter of vietnameseLetters) {
        if (event.body.indexOf(letter) == 0) {
            startsWithVietnameseLetterOrNumberOrSpecialChar = true;
            break;
        }
    }

    // Kiểm tra chữ số
    if (!startsWithVietnameseLetterOrNumberOrSpecialChar) {
        for (let number of numbers) {
            if (event.body.indexOf(number) == 0) {
                startsWithVietnameseLetterOrNumberOrSpecialChar = true;
                break;
            }
        }
    }

    // Kiểm tra ký tự đặc biệt
    if (!startsWithVietnameseLetterOrNumberOrSpecialChar) {
        for (let specialChar of specialChars) {
            if (event.body.indexOf(specialChar) == 0) {
                startsWithVietnameseLetterOrNumberOrSpecialChar = true;
                break;
            }
        }
    }

    // Nếu từ bắt đầu với một chữ cái tiếng Việt, một chữ số, hoặc ký tự đặc biệt, gửi phản hồi và nhấn cảm xúc
    if (startsWithVietnameseLetterOrNumberOrSpecialChar) {
        var msg = {
            body: ""
        };
        api.sendMessage(msg, threadID, messageID);
        api.setMessageReaction(randomReaction, event.messageID, (err) => {}, true);
    }
};

module.exports.run = function ({ api, event, client, __GLOBAL }) {

};
