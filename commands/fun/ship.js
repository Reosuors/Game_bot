const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('توافق')
        .setDescription('شوف نسبة التوافق بينك وبين شخص')
        .addUserOption(opt => opt.setName('الشخص').setDescription('اختر شخص').setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('الشخص');
        const user = interaction.user;

        if (target.id === user.id) {
            return interaction.reply({ embeds: [baseEmbed('💘 التوافق', 'تحب نفسك 100%! 😄')] });
        }

        const seed = [...user.id + target.id].reduce((a, c) => a + c.charCodeAt(0), 0);
        const percentage = seed % 101;

        const barLength = 20;
        const filled = Math.round((percentage / 100) * barLength);
        const bar = '💖'.repeat(filled) + '🤍'.repeat(barLength - filled);

        let comment;
        if (percentage >= 80) comment = 'توافق خرافي! 💞';
        else if (percentage >= 50) comment = 'توافق حلو! 😊';
        else if (percentage >= 20) comment = 'يحتاج شغل شوي 😅';
        else comment = 'ما فيه امل 💔';

        const embed = baseEmbed(
            '💘 نسبة التوافق',
            `${user} ❤️ ${target}\n\n${bar}\n**${percentage}%**\n\n${comment}`
        );
        await interaction.reply({ embeds: [embed] });
    }
};
