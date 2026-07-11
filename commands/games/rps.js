const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { baseEmbed, errorEmbed } = require('../../utils/embeds');

const CHOICES = { rock: '🪨 حجر', paper: '📄 ورقة', scissors: '✂️ مقص' };
const activeGames = new Map();

function decideWinner(c1, c2) {
    if (c1 === c2) return 'draw';
    const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
    return beats[c1] === c2 ? 'p1' : 'p2';
}

function buildButtons(gameId, disabled = false) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`rps_${gameId}_rock`).setLabel('🪨 حجر').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
        new ButtonBuilder().setCustomId(`rps_${gameId}_paper`).setLabel('📄 ورقة').setStyle(ButtonStyle.Primary).setDisabled(disabled),
        new ButtonBuilder().setCustomId(`rps_${gameId}_scissors`).setLabel('✂️ مقص').setStyle(ButtonStyle.Danger).setDisabled(disabled)
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('حجر-ورقة-مقص')
        .setDescription('العب حجر ورقة مقص ضد لاعب او ضد البوت')
        .addUserOption(opt =>
            opt.setName('الخصم')
                .setDescription('اختر لاعب، او اتركه فارغ للعب ضد البوت')
                .setRequired(false)
        ),

    activeGames,
    decideWinner,
    buildButtons,
    CHOICES,

    async execute(interaction) {
        const opponent = interaction.options.getUser('الخصم');
        const player1 = interaction.user;
        const isVsBot = !opponent || opponent.bot;

        if (opponent && opponent.id === player1.id) {
            return interaction.reply({ embeds: [errorEmbed('خطأ', 'ما تقدر تلعب ضد نفسك!')], ephemeral: true });
        }

        const player2 = isVsBot ? interaction.client.user : opponent;
        const gameId = interaction.id;

        activeGames.set(gameId, {
            player1: player1.id,
            player2: player2.id,
            choices: {},
            isVsBot
        });

        const embed = baseEmbed(
            '🪨📄✂️ حجر ورقة مقص',
            `${player1} ضد ${isVsBot ? '🤖 البوت' : player2}\n\nاضغطوا على اختياركم (يصل بشكل خاص لكل واحد بالأزرار)`
        );

        await interaction.reply({ embeds: [embed], components: [buildButtons(gameId)] });
    }
};
