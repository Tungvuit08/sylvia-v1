module.exports.config = {
    name: "antiout",
    eventType: ["log:unsubscribe"],
    version: "0.0.1",
    credits: "DungUwU",
    description: "Listen events"
};

module.exports.run = async ({
    event,
    api,
    Threads,
    Users
}) => {
    const moment = require("moment-timezone");
    var timeNow = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss")
    let data = (await Threads.getData(event.threadID)).data || {};
    if (data.antiout == false) return;
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
    const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
    const type = (event.author == event.logMessageData.leftParticipantFbId) ? "tự rời" : "bị quản trị viên đá";
    if (type == "tự rời") {
        api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error, info) => {
            if (error) {
                api.shareContact(`==== [ 𝗔𝗡𝗧𝗜 𝗢𝗨𝗧 ] ====\n[❌] 𝗣𝗵𝗮́𝘁 𝗵𝗶𝗲̣̂𝗻 𝘁𝗵𝗮̀𝗻𝗵 𝘃𝗶𝗲̂𝗻 ${name} 𝗿𝗼̛̀𝗶 𝗻𝗵𝗼́𝗺 ⚠\n➣ 𝗿𝗼̛̀𝗶 𝗻𝗵𝗼́𝗺 𝗹𝘂́𝗰 ${timeNow}\n[💫] 𝗔𝗻𝘁𝗶: 𝗙𝗮𝗹𝘀𝗲❌`, event.logMessageData.leftParticipantFbId, event.threadID)
            } else api.shareContact(`==== [ 𝗔𝗡𝗧𝗜 𝗢𝗨𝗧 ] ====\n[✅] 𝗣𝗵𝗮́𝘁 𝗵𝗶𝗲̣̂𝗻 𝘁𝗵𝗮̀𝗻𝗵 𝘃𝗶𝗲̂𝗻 ${name} 𝗿𝗼̛̀𝗶 𝗻𝗵𝗼́𝗺 ⚠\n➣ 𝗿𝗼̛̀𝗶 𝗻𝗵𝗼́𝗺 𝗹𝘂́𝗰 ${timeNow}\n[⚜] 𝗔𝗻𝘁𝗶: 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆🎉`, event.logMessageData.leftParticipantFbId, event.threadID);
        })
    }
}