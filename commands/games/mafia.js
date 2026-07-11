const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { baseEmbed, successEmbed, errorEmbed, COLORS } = require('../../utils/embeds');

// حالة كل لعبة مافيا مخزنة حسب ايدي القناة
const activeGames = new Map();

const ROLES = {
    MAFIA: 'مافيا 🔪',
    DOCTOR: 'طبيب 💉',
    DETECTIVE: 'محقق 🕵️',
    CIVILIAN: 'مواطن 👤'
};

function assignRoles(players) {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const mafiaCount = players.length >= 8 ? 2 : 1;
    const roles = {};

    for (let i = 0; i < mafiaCount; i++) roles[shuffled[i]] = ROLES.MAFIA;
    roles[shuffled[mafiaCount]] = ROLES.DOCTOR;
    if (shuffled[mafiaCount + 1]) roles[shuffled[mafiaCount + 1]] = ROLES.DETECTIVE;
    for (let i = mafiaCount + 2; i < shuffled.length; i++) roles[shuffled[i]] = ROLES.CIVILIAN;

    return roles;
}

function checkWinCondition(game) {
    const alive = game.players.filter(p => game.alive[p]);
    const mafiaAlive = alive.filter(p => game.roles[p] === ROLES.MAFIA);
    const townAlive = alive.filter(p => game.roles[p] !== ROLES.MAFIA);

    if (mafiaAlive.length === 0) return 'town';
    if (mafiaAlive.length >= townAlive.length) return 'mafia';
    return null;
}

function buildLobbyEmbed(game) {
    const playerList = game.players.map((id, i) => `${i + 1}. <@${id}>`).join('\n') || 'لا يوجد لاعبين بعد';
    return baseEmbed(
        '🎭 لعبة المافيا - غرفة الانتظار',
        `اضغط **انضمام** للمشاركة!\nالحد الادنى: 4 لاعبين\n\n**اللاعبون (${game.players.length}):**\n${playerList}\n\nصاحب اللعبة: <@${game.host}>`
    );
}

function buildLobbyButtons(gameId, disabled = false) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`mafia_join_${gameId}`).setLabel('✅ انضمام').setStyle(ButtonStyle.Success).setDisabled(disabled),
        new ButtonBuilder().setCustomId(`mafia_leave_${gameId}`).setLabel('🚪 خروج').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
        new ButtonBuilder().setCustomId(`mafia_start_${gameId}`).setLabel('▶️ ابدأ اللعبة').setStyle(ButtonStyle.Primary).setDisabled(disabled)
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('مافيا')
        .setDescription('ابدأ لعبة مافيا جماعية في هذه القناة (4 لاعبين على الاقل)'),

    activeGames,
    ROLES,
    assignRoles,
    checkWinCondition,
    buildLobbyEmbed,
    buildLobbyButtons,

    async execute(interaction) {
        const channelId = interaction.channelId;
        if (activeGames.has(channelId)) {
            return interaction.reply({ embeds: [errorEmbed('يوجد لعبة نشطة', 'فيه لعبة مافيا شغالة بهذه القناة حالياً')], ephemeral: true });
        }

        const gameId = channelId;
        const game = {
            gameId,
            channelId,
            host: interaction.user.id,
            players: [interaction.user.id],
            roles: {},
            alive: {},
            phase: 'lobby',
            nightActions: {},
            votes: {},
            dayCount: 0
        };
        activeGames.set(gameId, game);

        await interaction.reply({
            embeds: [buildLobbyEmbed(game)],
            components: [buildLobbyButtons(gameId)]
        });
    }
};
