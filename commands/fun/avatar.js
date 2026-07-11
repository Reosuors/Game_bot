const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('صورة-البروفايل')
        .setDescription('اعرض صورة بروفايل شخص بحجم كبير')
        .addUserOption(opt => opt.setName('الشخص').setDescription('اختر شخص').setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('الشخص') || interaction.user;
        const embed = baseEmbed('🖼️ صورة البروفايل', `صورة ${user}`)
            .setImage(user.displayAvatarURL({ size: 1024, extension: 'png' }));
        await interaction.reply({ embeds: [embed] });
    }
};
