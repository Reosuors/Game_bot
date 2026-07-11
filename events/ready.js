const { ActivityType } = require('discord.js');
const { deployCommands } = require('../utils/deployCommands');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`✅ البوت جاهز! تم تسجيل الدخول باسم ${client.user.tag}`);
        client.user.setPresence({
            activities: [{ name: '⚡ /مساعدة للاوامر', type: ActivityType.Playing }],
            status: 'online'
        });

        // يرفع اوامر Slash تلقائياً كل ما يشتغل البوت (مفيد على استضافات مثل Render)
        await deployCommands(client);
    }
};
