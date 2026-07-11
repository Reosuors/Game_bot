const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed, successEmbed, errorEmbed } = require('../../utils/embeds');
const { getUserEconomy, updateUserEconomy } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('قلب-العملة')
        .setDescription('اقلب عملة واراهن على النتيجة (اختياري)')
        .addStringOption(opt =>
            opt.setName('اختيارك')
                .setDescription('صورة او كتابة')
                .addChoices({ name: 'صورة', value: 'heads' }, { name: 'كتابة', value: 'tails' })
                .setRequired(false)
        )
        .addIntegerOption(opt =>
            opt.setName('رهان')
                .setDescription('عدد العملات اللي تراهن فيها (اختياري)')
                .setMinValue(1)
                .setRequired(false)
        ),

    async execute(interaction) {
        const choice = interaction.options.getString('اختيارك');
        const bet = interaction.options.getInteger('رهان');
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const resultText = result === 'heads' ? '🌕 صورة' : '🌑 كتابة';

        let description = `النتيجة: **${resultText}**`;

        if (choice && bet) {
            const economy = getUserEconomy(interaction.user.id);
            if (economy.balance < bet) {
                return interaction.reply({ embeds: [errorEmbed('رصيد غير كافي', `رصيدك الحالي: ${economy.balance} 🪙`)], ephemeral: true });
            }
            const won = choice === result;
            const newBalance = won ? economy.balance + bet : economy.balance - bet;
            updateUserEconomy(interaction.user.id, { balance: newBalance });
            description += won
                ? `\n\n🎉 ربحت! **+${bet} 🪙**\nرصيدك الجديد: ${newBalance} 🪙`
                : `\n\n😢 خسرت! **-${bet} 🪙**\nرصيدك الجديد: ${newBalance} 🪙`;
        }

        const embed = baseEmbed('🪙 قلب العملة', description);
        await interaction.reply({ embeds: [embed] });
    }
};
