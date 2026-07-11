const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { baseEmbed, successEmbed, errorEmbed } = require('../../utils/embeds');
const { getUserEconomy, updateUserEconomy } = require('../../utils/database');

const QUESTIONS = [
    { q: 'ما هي عاصمة السعودية؟', options: ['الرياض', 'جدة', 'مكة', 'الدمام'], answer: 0 },
    { q: 'كم عدد قارات العالم؟', options: ['5', '6', '7', '8'], answer: 2 },
    { q: 'ما هو اكبر كوكب في المجموعة الشمسية؟', options: ['الارض', 'المريخ', 'المشتري', 'زحل'], answer: 2 },
    { q: 'من مؤسس شركة مايكروسوفت؟', options: ['ستيف جوبز', 'بيل غيتس', 'ايلون ماسك', 'مارك زوكربيرغ'], answer: 1 },
    { q: 'كم عدد اضلاع المثلث؟', options: ['2', '3', '4', '5'], answer: 1 },
    { q: 'ما هي اطول نهر في العالم؟', options: ['الأمازون', 'النيل', 'الفرات', 'دجلة'], answer: 1 },
    { q: 'في اي عام انتهت الحرب العالمية الثانية؟', options: ['1943', '1945', '1950', '1939'], answer: 1 },
    { q: 'ما هي لغة البرمجة التي طورتها جوجل؟', options: ['Python', 'Go', 'Java', 'C#'], answer: 1 },
    { q: 'كم عدد ايام السنة الكبيسة؟', options: ['364', '365', '366', '367'], answer: 2 },
    { q: 'ما هو اسرع حيوان بري؟', options: ['الاسد', 'الفهد', 'النمر', 'الحصان'], answer: 1 }
];

const activeGames = new Map();
const letters = ['🇦', '🇧', '🇨', '🇩'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('اسئلة-ثقافية')
        .setDescription('اختبر معلوماتك بسؤال ثقافي واربح عملات!'),

    async execute(interaction) {
        const question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
        const gameId = interaction.id;
        activeGames.set(gameId, { question, answered: new Set() });

        const row = new ActionRowBuilder().addComponents(
            question.options.map((opt, i) =>
                new ButtonBuilder()
                    .setCustomId(`trivia_${gameId}_${i}`)
                    .setLabel(`${letters[i]} ${opt}`)
                    .setStyle(ButtonStyle.Secondary)
            )
        );

        const embed = baseEmbed('🧠 سؤال ثقافي', `**${question.q}**\n\nعندك 20 ثانية للإجابة! (اول اجابة صحيحة تربح 50 عملة 🪙)`);
        await interaction.reply({ embeds: [embed], components: [row] });

        setTimeout(async () => {
            if (activeGames.has(gameId)) {
                activeGames.delete(gameId);
                const timeoutEmbed = baseEmbed('⏰ انتهى الوقت', `الاجابة الصحيحة كانت: **${question.options[question.answer]}**`);
                try {
                    await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
                } catch {}
            }
        }, 20000);
    },

    activeGames,
    QUESTIONS
};
