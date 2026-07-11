const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('معلومات-السيرفر')
        .setDescription('اعرض معلومات عن السيرفر الحالي'),

    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({ embeds: [errorEmbed('خطأ', 'هذا الامر يعمل فقط داخل سيرفر')], ephemeral: true });
        }

        const guild = interaction.guild;
        const embed = baseEmbed('🏰 معلومات السيرفر', guild.name)
            .setThumbnail(guild.iconURL({ size: 256 }) || null)
            .addFields(
                { name: '👑 المالك', value: `<@${guild.ownerId}>`, inline: true },
                { name: '👥 الاعضاء', value: `${guild.memberCount}`, inline: true },
                { name: '📅 تاريخ الانشاء', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
                { name: '💬 عدد القنوات', value: `${guild.channels.cache.size}`, inline: true },
                { name: '😀 عدد الرموز', value: `${guild.emojis.cache.size}`, inline: true },
                { name: '🚀 مستوى البوست', value: `${guild.premiumTier}`, inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    }
};
