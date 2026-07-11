const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { getUserEconomy, updateUserEconomy } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('اعطاء')
        .setDescription('اعطِ عملات لشخص اخر')
        .addUserOption(opt => opt.setName('الشخص').setDescription('اختر شخص').setRequired(true))
        .addIntegerOption(opt => opt.setName('المبلغ').setDescription('كم عملة تريد تعطي').setMinValue(1).setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('الشخص');
        const amount = interaction.options.getInteger('المبلغ');

        if (target.id === interaction.user.id) {
            return interaction.reply({ embeds: [errorEmbed('خطأ', 'ما تقدر تعطي نفسك!')], ephemeral: true });
        }
        if (target.bot) {
            return interaction.reply({ embeds: [errorEmbed('خطأ', 'ما تقدر تعطي بوت عملات!')], ephemeral: true });
        }

        const senderEconomy = getUserEconomy(interaction.user.id);
        if (senderEconomy.balance < amount) {
            return interaction.reply({ embeds: [errorEmbed('رصيد غير كافي', `رصيدك الحالي: ${senderEconomy.balance} 🪙`)], ephemeral: true });
        }

        const receiverEconomy = getUserEconomy(target.id);
        updateUserEconomy(interaction.user.id, { balance: senderEconomy.balance - amount });
        updateUserEconomy(target.id, { balance: receiverEconomy.balance + amount });

        await interaction.reply({
            embeds: [successEmbed('تم التحويل', `${interaction.user} اعطى ${target} مبلغ **${amount} 🪙**`)]
        });
    }
};
