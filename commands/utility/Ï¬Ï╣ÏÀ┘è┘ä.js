const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { clearActiveChannel, getGuildConfig } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('تعطيل')
        .setDescription('الغِ تقييد البوت وخليه يشتغل بكل قنوات السيرفر من جديد')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        if (!interaction.inGuild()) {
            return interaction.reply({
                embeds: [errorEmbed('غير متاح', 'هذا الامر يشتغل بس داخل سيرفر')],
                ephemeral: true
            });
        }

        const config = getGuildConfig(interaction.guildId);
        if (!config.activeChannelId) {
            return interaction.reply({
                embeds: [errorEmbed('غير مفعّل اصلاً', 'البوت مو مقيد باي قناة، هو شغال بكل قنوات السيرفر')],
                ephemeral: true
            });
        }

        clearActiveChannel(interaction.guildId);

        await interaction.reply({
            embeds: [successEmbed('تم الإلغاء 🔓', 'البوت الحين يشتغل بكل قنوات السيرفر ✅')]
        });
    }
};
