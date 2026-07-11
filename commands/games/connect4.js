const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { baseEmbed, errorEmbed } = require('../../utils/embeds');

const ROWS = 6;
const COLS = 7;
const activeGames = new Map();

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function dropDisc(board, col, symbol) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][col]) {
            board[r][col] = symbol;
            return r;
        }
    }
    return -1;
}

function checkWin(board, symbol) {
    // افقي وعمودي وقطري
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] !== symbol) continue;
            const dirs = [[0,1],[1,0],[1,1],[1,-1]];
            for (const [dr, dc] of dirs) {
                let count = 0;
                for (let k = 0; k < 4; k++) {
                    const nr = r + dr * k, nc = c + dc * k;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === symbol) count++;
                    else break;
                }
                if (count === 4) return true;
            }
        }
    }
    return false;
}

function isFull(board) {
    return board[0].every(cell => cell !== null);
}

function renderBoard(board) {
    const emojiMap = { X: '🔴', O: '🟡', null: '⚪' };
    let text = '';
    for (let r = 0; r < ROWS; r++) {
        text += board[r].map(cell => emojiMap[cell]).join('') + '\n';
    }
    text += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';
    return text;
}

function buildButtons(gameId, board, disabled = false) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < COLS; c++) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`c4_${gameId}_${c}`)
                .setLabel(`${c + 1}`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disabled || board[0][c] !== null)
        );
    }
    return [row];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('اربعة-متصلة')
        .setDescription('العب اربعة متصلة (Connect Four) ضد لاعب اخر')
        .addUserOption(opt => opt.setName('الخصم').setDescription('اختر لاعب تلعب ضده').setRequired(true)),

    activeGames,
    dropDisc,
    checkWin,
    isFull,
    renderBoard,
    buildButtons,
    createBoard,

    async execute(interaction) {
        const opponent = interaction.options.getUser('الخصم');
        const player1 = interaction.user;

        if (opponent.id === player1.id) {
            return interaction.reply({ embeds: [errorEmbed('خطأ', 'ما تقدر تلعب ضد نفسك!')], ephemeral: true });
        }
        if (opponent.bot) {
            return interaction.reply({ embeds: [errorEmbed('خطأ', 'هذه اللعبة تحتاج لاعب حقيقي، اختر عضو من السيرفر')], ephemeral: true });
        }

        const gameId = interaction.id;
        const board = createBoard();
        activeGames.set(gameId, {
            board,
            player1: player1.id,
            player2: opponent.id,
            currentTurn: player1.id,
            symbols: { [player1.id]: 'X', [opponent.id]: 'O' }
        });

        const embed = baseEmbed(
            '🔴🟡 اربعة متصلة',
            `${player1} (🔴) ضد ${opponent} (🟡)\n\n${renderBoard(board)}\n\nدور: **${player1}**`
        );

        await interaction.reply({ embeds: [embed], components: buildButtons(gameId, board) });
    }
};
