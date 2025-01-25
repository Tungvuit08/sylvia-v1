const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const crypto = require('crypto');
const cron = require('node-cron');

const RENT_DATA_PATH = path.join(__dirname, '/data/thuebot.json');
const RENT_KEY_PATH = path.join(__dirname, '/data/keys.json');
const TIMEZONE = 'Asia/Ho_Chi_Minh';

let data = fs.existsSync(RENT_DATA_PATH) ? JSON.parse(fs.readFileSync(RENT_DATA_PATH, 'utf8')) : [];
let keys = fs.existsSync(RENT_KEY_PATH) ? JSON.parse(fs.readFileSync(RENT_KEY_PATH, 'utf8')) : {};

const saveData = () => fs.writeFileSync(RENT_DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
const saveKeys = () => fs.writeFileSync(RENT_KEY_PATH, JSON.stringify(keys, null, 2), 'utf8');
const formatDate = input => input.split('/').reverse().join('/');
const isInvalidDate = date => isNaN(new Date(date).getTime());

function generateKey() {
    const randomString = crypto.randomBytes(6).toString('hex').slice(0, 6);
    return `Lunar_${randomString}`.toLowerCase();
}

module.exports.config = {
    name: 'rent',
    version: '1.5.0',
    hasPermssion: 3,
    credits: 'Lương Trường Khôi',
    description: "lỗi ib fb.com/Khoi.Meta ",
    commandCategory: 'Admin',
    usePrefix: false,
    usages: 'add|info|list|newkey|check',
    cooldowns: 1
};

module.exports.run = async function (o) {
    const send = (msg, callback) => o.api.sendMessage(msg, o.event.threadID, callback, o.event.messageID);
    const prefix = global.config.PREFIX;
    if (!global.config.ADMINBOT.includes(o.event.senderID)) {
        return send(`⚠️ Chỉ Admin chính mới có thể sử dụng!`);
    } 
    switch (o.args[0]) {
        case 'add':
            if (!o.args[1]) return send(`❎ Dùng ${prefix}${this.config.name} add + reply tin nhắn người cần thuê`);
            let userId = o.event.senderID;
            if (o.event.type === "message_reply") {
                userId = o.event.messageReply.senderID;
            } else if (Object.keys(o.event.mentions).length > 0) {
                userId = Object.keys(o.event.mentions)[0];
            }
            let t_id = o.event.threadID;
            let time_start = moment.tz(TIMEZONE).format('DD/MM/YYYY');
            let time_end = o.args[1];
            if (o.args.length === 4 && !isNaN(o.args[1]) && !isNaN(o.args[2]) && o.args[3].match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
                t_id = o.args[1];
                userId = o.args[2];
                time_end = o.args[3];
            } else if (o.args.length === 3 && !isNaN(o.args[1]) && o.args[2].match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
                userId = o.args[1];
                time_end = o.args[2];
            }
            if (isNaN(userId) || isNaN(t_id) || isInvalidDate(formatDate(time_start)) || isInvalidDate(formatDate(time_end)))
                return send(`❎ ID hoặc Thời Gian Không Hợp Lệ!`);
            const existingData = data.find(entry => entry.t_id === t_id);
            if (existingData) {
                return send(`⚠️ Nhóm này đã có dữ liệu thuê bot!`);
            }
            data.push({ t_id, id: userId, time_start, time_end });

            // Update nickname after adding
            const daysRemaining = Math.ceil((new Date(formatDate(time_end)).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const nickname = `『 ${global.config.PREFIX} 』 ⪼ ${(!global.config.BOTNAME) ? "Lunar Project🌙" : global.config.BOTNAME} | HSD: ${time_end} còn ${daysRemaining} ngày ✔`;
            try {
                await o.api.changeNickname(nickname, t_id, o.api.getCurrentUserID());
                console.log(`✅ Đã cập nhật biệt danh cho nhóm ${t_id}: ${nickname}`);
            } catch (err) {
                send(`❌ Lỗi khi cập nhật biệt danh cho nhóm !\n✨Tiến hành bypass lỗi và set data vào cơ sở dữ liệu..`);
                console.error(`❌ Lỗi khi cập nhật biệt danh cho nhóm ${t_id}:`, err);
            }

            send(`✅ Đã thêm dữ liệu thuê bot cho nhóm!`);
            break;
        case 'info':
            const rentInfo = data.find(entry => entry.t_id === o.event.threadID);
            if (!rentInfo) {
                send(`❎ Không có dữ liệu thuê bot cho nhóm này`);
            } else {
                const keyInfo = Object.entries(keys).find(([key, info]) => info.groupId === rentInfo.t_id) || ['Chưa có key', {}];
                const [key, keyDetails] = keyInfo;
                const daysRemaining = Math.floor((new Date(formatDate(rentInfo.time_end)).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const hoursRemaining = Math.floor((new Date(formatDate(rentInfo.time_end)).getTime() - Date.now()) / (1000 * 60 * 60) % 24);

                send({
                    body: `[ Thông Tin Thuê Bot ]\n\n👤 Người thuê: ${global.data.userName.get(rentInfo.id)}\n🔗 Link facebook: https://www.facebook.com/profile.php?id=${rentInfo.id}\n🗓️ Ngày Thuê: ${rentInfo.time_start}\n⌛ Hết Hạn: ${rentInfo.time_end}\n🔑 Key: ${key}\n\n⩺ Còn ${daysRemaining} ngày ${hoursRemaining} giờ là hết hạn`,
                    attachment: [await streamURL(`https://graph.facebook.com/${rentInfo.id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)]
                });
            }
            break;

        case 'list':
            if (data.length === 0) {
                send('❎ Không có nhóm nào đang thuê bot!');
                break;
            }
            send(`[ DANH SÁCH THUÊ BOT ]\n\n${data.map((item, i) => `━━━━━━━━━━━━━━━━━━━\n➤ ${i + 1}. 👤 Người thuê: ${global.data.userName.get(item.id)}\n➤ 📝 Tình trạng:${new Date(formatDate(item.time_end)).getTime() >= Date.now() ? 'Chưa Hết Hạn ✅' : 'Đã Hết Hạn ❎'}\n➤ 🔰 Nhóm: ${(global.data.threadInfo.get(item.t_id) || {}).threadName}`).join('\n')}\n━━━━━━━━━━━━━━━━━━━\n➤  Reply [ del | out | giahan ] + stt để thực hiện hành động`, (err, res) => {       
                res.name = exports.config.name;
                res.event = o.event;
                res.data = data;
                global.client.handleReply.push({ ...res, type: 'list' });
            });
            break;

        case 'newkey':
            const groupId = o.event.threadID;
            const existingGroupData = data.find(entry => entry.t_id === groupId);
            const expiryDate = o.args[1] || moment.tz(TIMEZONE).add(1, 'month').format('DD/MM/YYYY');
            if (isInvalidDate(formatDate(expiryDate))) {
                return send(`❎ Ngày hết hạn không hợp lệ! Định dạng ngày hợp lệ: DD/MM/YYYY`);
            }
            const generatedKey = generateKey();
            keys[generatedKey] = {
                expiryDate: expiryDate,
                used: false,
                groupId: null
            };
            send(`🔑 New key: ${generatedKey}\n📆 Thời hạn Key: ${expiryDate}`);
            saveKeys();
            break;

        case 'check':
            if (Object.keys(keys).length === 0) {
                send('❎ Không có key nào được tạo!');
                break;
            }
            send(`[ DANH SÁCH KEY ]\n\n${Object.entries(keys).map(([key, info], i) => 
                `${i + 1}. Key: ${key}\n🗓️ Ngày hết hạn: ${info.expiryDate}\n📝 Tình Trạng: ${info.used ? '✅ Đã sử dụng' : '❎ Chưa sử dụng'}📎 ID Nhóm: ${info.groupId || 'Chưa sử dụng'}\n`
            ).join('\n\n')}\n\n\n⩺ Tự Động Làm Mới Vào 00:00 Hàng Ngày!`);
            break;

        default:
            send(`Dùng: ${global.config.PREFIX}rent add → Để thêm nhóm vào danh sách thuê bot\nDùng: ${global.config.PREFIX}rent list → Để xem danh sách thuê bot\nDùng: ${global.config.PREFIX}rent newkey <ngày hết hạn> → Để tạo key thuê bot\n${global.config.PREFIX}rent check: xem danh sách key \n𝗛𝗗𝗦𝗗 → ${global.config.PREFIX}rent lệnh cần dùng.`);
            break;
    }
    saveData();
};

exports.handleEvent = async function (o) {
    const send = (msg, callback) => o.api.sendMessage(msg, o.threadID, callback, o.messageID);
    if (o.body && o.body.startsWith('Lunar_')) {
        let key = o.body.trim();
        if (!keys[key]) return send(`❎ Key không hợp lệ hoặc đã hết hạn.`);
        let time_end = keys[key];
        let time_start = moment.tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY');
        let t_id = o.threadID;
        let id = o.senderID;

        data.push({
            t_id,
            id,
            time_start,
            time_end,
        });

        delete keys[key];
        saveData();
        saveKeys();
        // Update nickname 
        const daysRemaining = Math.ceil((new Date(formatDate(time_end)).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const nickname = `『 ${global.config.PREFIX} 』 ⪼ ${(!global.config.BOTNAME) ? "Lunar Project🌙" : global.config.BOTNAME} | HSD: ${time_end} còn ${daysRemaining} ngày ✔`;
        try {
            await o.api.changeNickname(nickname, t_id, o.api.getCurrentUserID());
            console.log(`✅ Đã cập nhật biệt danh cho nhóm ${t_id}: ${nickname}`);
        } catch (err) {
            send(`❌ Lỗi khi cập nhật biệt danh cho nhóm !\n✨Tiến hành bypass lỗi và set data vào cơ sở dữ liệu..`);
            console.error(`❌ Lỗi khi cập nhật biệt danh cho nhóm ${t_id}:`, err);
        }
        send(`☑️ Key hợp lệ! Bạn đã được thêm vào danh sách thuê bot, ngày hết hạn: ${time_end}`);

    }
}

module.exports.handleReply = async function (o) {
    const send = (msg, callback) => o.api.sendMessage(msg, o.event.threadID, callback, o.event.messageID);
    const { type, data } = o.handleReply;
    const args = o.event.body.split(' ');
    const command = args.shift().toLowerCase();
    const index = parseInt(command);

    if (isNaN(index)) {
        switch (command) {
            case 'del':
                args.sort((a, b) => b - a).forEach($ => {
                    const groupId = data[$ - 1].t_id;
                    data.splice($ - 1, 1);
                });
                send('✅ Đã xóa thành công!');
                break;
            case 'out':
                for (const i of args) {
                    await o.api.removeUserFromGroup(o.api.getCurrentUserID(), data[i - 1].t_id);
                }
                send('✅ Đã out nhóm theo yêu cầu');
                break;
            case 'giahan':
                const [STT, time_end] = args;
                if (isInvalidDate(formatDate(time_end))) return send('❎ Thời Gian Không Hợp Lệ!');
                if (!data[STT - 1]) return send('❎ Số thứ tự không tồn tại');
                const time_start = moment.tz(TIMEZONE).format('DD/MM/YYYY');
                Object.assign(data[STT - 1], { time_start, time_end });

                // Update nickname after extending
                const groupId = data[STT - 1].t_id;
                const daysRemaining = Math.ceil((new Date(formatDate(time_end)).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const nickname = `『 ${global.config.PREFIX} 』 ⪼ ${(!global.config.BOTNAME) ? "Lunar Project🌙" : global.config.BOTNAME} | HSD: ${time_end} còn ${daysRemaining} ngày ✔`;
                try {
                    await o.api.changeNickname(nickname, groupId, o.api.getCurrentUserID());
                    console.log(`✅ Đã cập nhật biệt danh cho nhóm ${groupId}: ${nickname}`);
                } catch (err) {
                    send(`❌ Lỗi khi cập nhật biệt danh cho nhóm !\n✨Tiến hành bypass lỗi và set data vào cơ sở dữ liệu..`);
                    console.error(`❌ Lỗi khi cập nhật biệt danh cho nhóm ${groupId}:`, err);
                }

                send('✅ Gia hạn nhóm thành công !');
                break;
            default:
                send('❎ Lệnh không hợp lệ!');
                break;
        }
    } else {
        if (type === 'list') {
            if (index < 1 || index > data.length) {
                return send('❎ Số thứ tự không hợp lệ!');
            }
            const entry = data[index - 1];
            let threadInfo = await o.api.getThreadInfo(entry.t_id);
            send({
                body: `[ Thông Tin Thuê Bot ]\n\n👤 Người thuê: ${global.data.userName.get(entry.id)}\n🔗 Link facebook: https://www.facebook.com/profile.php?id=${entry.id}\n🗓️ Ngày Thuê: ${entry.time_start}\n⌛ Hết Hạn: ${entry.time_end}\n\n⩺ Còn ${Math.floor((new Date(formatDate(entry.time_end)).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ngày ${Math.floor((new Date(formatDate(entry.time_end)).getTime() - Date.now()) / (1000 * 60 * 60) % 24)} giờ là hết hạn`,
                attachment: [await streamURL(`https://graph.facebook.com/${entry.id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`), await streamURL(threadInfo.imageSrc)]
            });
        }
    }
    saveData();
    saveKeys();
};

const updateGroupNicknames = async () => {
    for (const entry of data) {
        const groupId = entry.t_id;
        const daysRemaining = Math.ceil((new Date(formatDate(entry.time_end)).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) continue; // Skip expired groups

        const nickname = `『 ${global.config.PREFIX} 』 ⪼ ${(!global.config.BOTNAME) ? "Lunar Project🌙" : global.config.BOTNAME} | HSD: ${entry.time_end} còn ${daysRemaining} ngày ✔`;
        try {
            await o.api.changeNickname(nickname, groupId, o.api.getCurrentUserID());
            console.log(`✅ Đã cập nhật biệt danh cho nhóm ${groupId}: ${nickname}`);
        } catch (err) {
            send(`❌ Lỗi khi cập nhật biệt danh cho nhóm !\n✨Tiến hành bypass lỗi và set data vào cơ sở dữ liệu..`);
            console.error(`❌ Lỗi khi cập nhật biệt danh cho nhóm ${groupId}:`, err);
        }
    }
};

// Tạo cron job chạy hàng ngày vào 00:00
cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Đang cập nhật biệt danh các nhóm...');
    await updateGroupNicknames();
});
async function streamURL(url, mime = 'jpg') {
                const dest = `${__dirname}/data/${Date.now()}.${mime}`,
                        downloader = require('image-downloader'),
                        fse = require('fs-extra');
                await downloader.image({
                        url, dest
                });
                setTimeout(j => fse.unlinkSync(j), 60 * 1000, dest);
                return fse.createReadStream(dest);
        };