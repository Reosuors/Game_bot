const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('بينق')
        .setDescription('اعرض سرعة استجابة البوت'),

    async execute(interaction) {
        const sent = await interaction.reply({ embeds: [baseEmbed('🏓 بينق', 'جاري القياس...')], fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        await interaction.editReply({
            embeds: [baseEmbed('🏓 بونق!', `📶 زمن استجابة البوت: **${latency}ms**\n💓 زمن استجابة API: **${apiLatency}ms**`)]
        });
    }
};
