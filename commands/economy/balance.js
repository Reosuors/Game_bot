const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');
const { getUserEconomy } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('رصيد')
        .setDescription('اعرض رصيدك من العملات')
        .addUserOption(opt => opt.setName('الشخص').setDescription('اختر شخص').setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('الشخص') || interaction.user;
        const economy = getUserEconomy(target.id);

        const embed = baseEmbed(
            '💰 الرصيد',
            `${target}\n\n🪙 **المحفظة:** ${economy.balance}\n🏦 **البنك:** ${economy.bank}\n💵 **الاجمالي:** ${economy.balance + economy.bank}`
        );
        await interaction.reply({ embeds: [embed] });
    }
};
