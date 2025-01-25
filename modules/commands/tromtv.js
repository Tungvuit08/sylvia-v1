module.exports.config = {
    name: 'tromtv',
    version: '1.0.0',
    hasPermssion: 2,
    usePrefix: true, // Đã thêm usePrefix
    credits: 'mây trắng',
    description: 'Thêm tất cả thành viên từ một nhóm khác vào nhóm hiện tại',
    commandCategory: 'Admin',
    usages: '[uid nhóm]',
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const send = (msg, callback) => api.sendMessage(msg, threadID, callback, messageID);

    if (args.length !== 1) {
        return send("Sai cú pháp. Vui lòng nhập đúng cú pháp: .tromtv [uid nhóm] để thêm thành viên từ nhóm khác", threadID, messageID);
    }

    const sourceThreadID = args[0];

    try {
        const sourceThreadInfo = await api.getThreadInfo(sourceThreadID);
        const memberIDs = sourceThreadInfo.participantIDs;

        send(`Đang thêm ${memberIDs.length} thành viên từ nhóm ${sourceThreadID} vào nhóm hiện tại...`, threadID, messageID);

        for (const id of memberIDs) {
            try {
                await api.addUserToGroup(id, threadID);
            } catch (error) {
                console.error(`Không thể thêm thành viên ${id}: ${error.message}`);
            }
        }

        send(`Đã thêm thành công ${memberIDs.length} thành viên từ nhóm ${sourceThreadID} vào nhóm hiện tại.`, threadID, messageID);
    } catch (error) {
        send(`Đã xảy ra lỗi khi lấy thông tin nhóm hoặc thêm thành viên: ${error.message}`, threadID, messageID);
    }
};
