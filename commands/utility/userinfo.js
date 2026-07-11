const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');
const { getUserLevel, getUserEconomy } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('معلومات-العضو')
        .setDescription('اعرض معلومات عن عضو في السيرفر')
        .addUserOption(opt => opt.setName('الشخص').setDescription('اختر شخص').setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('الشخص') || interaction.user;
        const member = interaction.guild ? await interaction.guild.members.fetch(target.id).catch(() => null) : null;
        const level = getUserLevel(target.id);
        const economy = getUserEconomy(target.id);

        const embed = baseEmbed('👤 معلومات العضو', `معلومات ${target}`)
            .setThumbnail(target.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '📛 الاسم', value: target.tag, inline: true },
                { name: '🆔 الايدي', value: target.id, inline: true },
                { name: '📅 انشأ حسابه', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:D>`, inline: true },
                ...(member ? [{ name: '📥 انضم للسيرفر', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true }] : []),
                { name: '⭐ المستوى', value: `${level.level}`, inline: true },
                { name: '🪙 العملات', value: `${economy.balance + economy.bank}`, inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    }
};
