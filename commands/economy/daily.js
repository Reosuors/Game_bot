const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { getUserEconomy, updateUserEconomy } = require('../../utils/database');

const DAILY_AMOUNT = 200;
const COOLDOWN = 24 * 60 * 60 * 1000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('يومي')
        .setDescription('استلم مكافأتك اليومية من العملات'),

    async execute(interaction) {
        const economy = getUserEconomy(interaction.user.id);
        const now = Date.now();

        if (now - economy.lastDaily < COOLDOWN) {
            const remaining = COOLDOWN - (now - economy.lastDaily);
            const hours = Math.floor(remaining / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);
            return interaction.reply({
                embeds: [errorEmbed('لسا بدري!', `تقدر تاخذ مكافأتك بعد **${hours} ساعة و ${minutes} دقيقة**`)],
                ephemeral: true
            });
        }

        updateUserEconomy(interaction.user.id, {
            balance: economy.balance + DAILY_AMOUNT,
            lastDaily: now
        });

        await interaction.reply({
            embeds: [successEmbed('المكافأة اليومية', `استلمت **${DAILY_AMOUNT} 🪙**!\nارجع بكرة تاخذ مكافأة جديدة`)]
        });
    }
};
