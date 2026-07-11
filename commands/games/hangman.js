const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { baseEmbed, successEmbed, errorEmbed } = require('../../utils/embeds');

const WORDS = [
    'برمجة', 'حاسوب', 'انترنت', 'رياضة', 'كرة القدم', 'سفر', 'طبخ', 'موسيقى',
    'مدرسة', 'جامعة', 'كتاب', 'سيارة', 'طائرة', 'شمس', 'قمر', 'نجوم',
    'صحراء', 'جبل', 'بحر', 'نهر', 'قهوة', 'شاي', 'هاتف', 'حاسبة'
];

const HANGMAN_STAGES = [
    '```\n  ____\n |    |\n |\n |\n |\n_|_\n```',
    '```\n  ____\n |    |\n |    O\n |\n |\n_|_\n```',
    '```\n  ____\n |    |\n |    O\n |    |\n |\n_|_\n```',
    '```\n  ____\n |    |\n |    O\n |   /|\n |\n_|_\n```',
    '```\n  ____\n |    |\n |    O\n |   /|\\\n |\n_|_\n```',
    '```\n  ____\n |    |\n |    O\n |   /|\\\n |   /\n_|_\n```',
    '```\n  ____\n |    |\n |    O\n |   /|\\\n |   / \\\n_|_\n```'
];

const activeGames = new Map();

function maskWord(word, guessed) {
    return word.split('').map(ch => (ch === ' ' ? ' ' : guessed.includes(ch) ? ch : '⬜')).join(' ');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('حروف-الشنق')
        .setDescription('العب لعبة تخمين الكلمة (Hangman) في هذه القناة'),

    activeGames,
    maskWord,
    HANGMAN_STAGES,

    async execute(interaction) {
        const channelId = interaction.channelId;
        if (activeGames.has(channelId)) {
            return interaction.reply({ embeds: [errorEmbed('يوجد لعبة نشطة', 'فيه لعبة شنق شغالة بهذه القناة، خلصوها اول')], ephemeral: true });
        }

        const word = WORDS[Math.floor(Math.random() * WORDS.length)];
        const gameState = {
            word,
            guessed: [],
            wrongGuesses: 0,
            maxWrong: 6,
            starter: interaction.user.id
        };
        activeGames.set(channelId, gameState);

        const embed = baseEmbed(
            '🔤 لعبة تخمين الكلمة',
            `${HANGMAN_STAGES[0]}\n**الكلمة:** ${maskWord(word, [])}\n\nاكتب حرف واحد في الشات للتخمين!\nمحاولات متبقية: **${gameState.maxWrong}**`
        );

        await interaction.reply({ embeds: [embed] });
    }
};
