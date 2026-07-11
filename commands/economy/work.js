const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { getUserEconomy, updateUserEconomy } = require('../../utils/database');

const COOLDOWN = 60 * 60 * 1000; // ساعة وحدة
const JOBS = [
    { name: 'مبرمج', min: 50, max: 150 },
    { name: 'طباخ', min: 30, max: 100 },
    { name: 'سائق تاكسي', min: 40, max: 120 },
    { name: 'مصمم', min: 45, max: 130 },
    { name: 'بائع', min: 20, max: 90 },
    { name: 'صياد', min: 25, max: 110 }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('اعمل')
        .setDescription('اشتغل شغلة عشوائية واكسب عملات'),

    async execute(interaction) {
        const economy = getUserEconomy(interaction.user.id);
        const now = Date.now();

        if (now - economy.lastWork < COOLDOWN) {
            const remaining = COOLDOWN - (now - economy.lastWork);
            const minutes = Math.ceil(remaining / 60000);
            return interaction.reply({
                embeds: [errorEmbed('تعبان؟', `لازم تستريح! تقدر تشتغل بعد **${minutes} دقيقة**`)],
                ephemeral: true
            });
        }

        const job = JOBS[Math.floor(Math.random() * JOBS.length)];
        const earned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

        updateUserEconomy(interaction.user.id, {
            balance: economy.balance + earned,
            lastWork: now
        });

        await interaction.reply({
            embeds: [successEmbed('شغل شاطر!', `اشتغلت كـ **${job.name}** وكسبت **${earned} 🪙**`)]
        });
    }
};
