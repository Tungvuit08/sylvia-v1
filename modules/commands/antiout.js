module.exports.config = {
    name: "antiout",
    version: "1.0.0",
    hasPermssion: 1,
    description: "Bật tắt antiout",
    usages: "antiout on/off",
    commandCategory: "Group",
    cooldowns: 0
};

module.exports.run = async({ api, event, Threads}) => {
    let data = (await Threads.getData(event.threadID)).data || {};
    if (typeof data["antiout"] == "undefined" || data["antiout"] == false) data["antiout"] = true;
    else data["antiout"] = false;
    
    await Threads.setData(event.threadID, { data });
    global.data.threadData.set(parseInt(event.threadID), data);
    
    return api.sendMessage(`[ 𝗔𝗡𝗧𝗜𝗢𝗨𝗧 ]\nĐã ${(data["antiout"] == true) ? "bật" : "tắt"} thành công chống out chùa!`, event.threadID);

}