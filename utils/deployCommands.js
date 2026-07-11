const { REST, Routes } = require('discord.js');

async function deployCommands(client) {
    const token = process.env.TOKEN;
    const clientId = process.env.CLIENT_ID || client.user?.id;
    const guildId = process.env.GUILD_ID;

    if (!token || !clientId) {
        console.warn('⚠️ ما قدرت ارفع الاوامر تلقائياً: تأكد من وجود TOKEN و CLIENT_ID في متغيرات البيئة');
        return;
    }

    const commands = client.commands.map(cmd => cmd.data.toJSON());
    const rest = new REST().setToken(token);

    try {
        if (guildId) {
            const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
            console.log(`✅ تم رفع ${data.length} امر تلقائياً على السيرفر المحدد (فوري)`);
        } else {
            const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
            console.log(`✅ تم رفع ${data.length} امر تلقائياً بشكل عالمي (قد تأخذ حتى ساعة للظهور)`);
        }
    } catch (err) {
        console.error('❌ صار خطأ اثناء رفع الاوامر تلقائياً:', err);
    }
}

module.exports = { deployCommands };
