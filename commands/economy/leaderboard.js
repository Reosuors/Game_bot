const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');
const { getAllEconomy } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('المتصدرين')
        .setDescription('اعرض قائمة اغنى الاعضاء'),

    async execute(interaction) {
        const all = getAllEconomy();
        const sorted = Object.entries(all)
            .map(([id, data]) => ({ id, total: data.balance + data.bank }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        if (sorted.length === 0) {
            return interaction.reply({ embeds: [baseEmbed('🏆 المتصدرين', 'لا يوجد بيانات بعد!')] });
        }

        const medals = ['🥇', '🥈', '🥉'];
        const list = sorted.map((entry, i) => `${medals[i] || `**${i + 1}.**`} <@${entry.id}> — ${entry.total} 🪙`).join('\n');

        await interaction.reply({ embeds: [baseEmbed('🏆 قائمة المتصدرين', list)] });
    }
};
