require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        if ('data' in command) commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`⏳ جاري رفع ${commands.length} امر...`);

        let data;
        if (process.env.GUILD_ID) {
            // رفع سريع لسيرفر واحد (فوري) - مناسب للتجربة
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log(`✅ تم رفع ${data.length} امر بنجاح على السيرفر المحدد (فوري)`);
        } else {
            // رفع عالمي (يأخذ حتى ساعة للظهور)
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            console.log(`✅ تم رفع ${data.length} امر بنجاح بشكل عالمي (قد يأخذ حتى ساعة للظهور)`);
        }
    } catch (error) {
        console.error('❌ صار خطأ اثناء رفع الاوامر:', error);
    }
})();
