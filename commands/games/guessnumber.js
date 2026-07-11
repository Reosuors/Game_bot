const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed, errorEmbed, successEmbed } = require('../../utils/embeds');
const { updateUserEconomy, getUserEconomy } = require('../../utils/database');

const activeGames = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('خمن-الرقم')
        .setDescription('البوت يختار رقم بين 1 و 100، حاول تخمنه بأقل عدد محاولات!'),

    activeGames,

    async execute(interaction) {
        const channelId = interaction.channelId;
        if (activeGames.has(channelId)) {
            return interaction.reply({ embeds: [errorEmbed('يوجد لعبة نشطة', 'فيه لعبة تخمين شغالة بهذه القناة')], ephemeral: true });
        }

        const number = Math.floor(Math.random() * 100) + 1;
        activeGames.set(channelId, { number, attempts: 0, player: interaction.user.id, maxAttempts: 7 });

        const embed = baseEmbed(
            '🔢 خمن الرقم',
            `اخترت رقم سري بين **1** و **100**!\nعندك **7 محاولات**، اكتب رقمك في الشات يا ${interaction.user}`
        );
        await interaction.reply({ embeds: [embed] });
    }
};
