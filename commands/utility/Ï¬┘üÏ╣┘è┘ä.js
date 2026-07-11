const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { setActiveChannel, getGuildConfig } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('تفعيل')
        .setDescription('فعّل البوت بحيث يشتغل بس في هذه القناة ولا يستجيب لأي قناة ثانية')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        if (!interaction.inGuild()) {
            return interaction.reply({
                embeds: [errorEmbed('غير متاح', 'هذا الامر يشتغل بس داخل سيرفر')],
                ephemeral: true
            });
        }

        const config = getGuildConfig(interaction.guildId);
        if (config.activeChannelId === interaction.channelId) {
            return interaction.reply({
                embeds: [errorEmbed('مفعّل مسبقاً', `البوت مفعّل بالفعل في هذه القناة فقط ✅`)],
                ephemeral: true
            });
        }

        setActiveChannel(interaction.guildId, interaction.channelId);

        await interaction.reply({
            embeds: [successEmbed(
                'تم تفعيل البوت 🔒',
                `من الان البوت يشتغل بس في ${interaction.channel} ولن يستجيب لأي امر في اي قناة ثانية بالسيرفر.\n\n` +
                'اذا تبي ترجع البوت يشتغل بكل القنوات، استخدم الامر `/تعطيل`.'
            )]
        });
    }
};
