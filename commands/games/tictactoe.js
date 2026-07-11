const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { baseEmbed, successEmbed, errorEmbed } = require('../../utils/embeds');

// تخزين الجلسات النشطة بالذاكرة
const activeGames = new Map();

function checkWinner(board) {
    const lines = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (const [a,b,c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    if (board.every(cell => cell !== null)) return 'draw';
    return null;
}

// خوارزمية مينيماكس بسيطة لذكاء البوت
function minimax(board, isMaximizing, botSymbol, playerSymbol) {
    const winner = checkWinner(board);
    if (winner === botSymbol) return { score: 10 };
    if (winner === playerSymbol) return { score: -10 };
    if (winner === 'draw') return { score: 0 };

    const moves = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            const newBoard = [...board];
            newBoard[i] = isMaximizing ? botSymbol : playerSymbol;
            const result = minimax(newBoard, !isMaximizing, botSymbol, playerSymbol);
            moves.push({ index: i, score: result.score });
        }
    }

    if (isMaximizing) {
        return moves.reduce((best, m) => (m.score > best.score ? m : best), { score: -Infinity });
    } else {
        return moves.reduce((best, m) => (m.score < best.score ? m : best), { score: Infinity });
    }
}

function getBotMove(board, botSymbol, playerSymbol) {
    const best = minimax(board, true, botSymbol, playerSymbol);
    return best.index;
}

function buildBoard(board, gameId, disabled = false) {
    const rows = [];
    for (let r = 0; r < 3; r++) {
        const row = new ActionRowBuilder();
        for (let c = 0; c < 3; c++) {
            const idx = r * 3 + c;
            const val = board[idx];
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ttt_${gameId}_${idx}`)
                    .setLabel(val ? val : '‌')
                    .setStyle(val === 'X' ? ButtonStyle.Danger : val === 'O' ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled || val !== null)
            );
        }
        rows.push(row);
    }
    return rows;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('اكس-او')
        .setDescription('العب اكس اند او (Tic Tac Toe) ضد لاعب اخر او ضد البوت')
        .addUserOption(opt =>
            opt.setName('الخصم')
                .setDescription('اختر لاعب تلعب ضده، او اتركه فارغ للعب ضد البوت')
                .setRequired(false)
        ),

    activeGames,
    buildBoard,
    checkWinner,
    getBotMove,

    async execute(interaction) {
        const opponent = interaction.options.getUser('الخصم');
        const player1 = interaction.user;
        const isVsBot = !opponent || opponent.bot;

        if (opponent && opponent.id === player1.id) {
            return interaction.reply({ embeds: [errorEmbed('خطأ', 'ما تقدر تلعب ضد نفسك!')], ephemeral: true });
        }

        const player2 = isVsBot ? interaction.client.user : opponent;
        const gameId = `${interaction.id}`;
        const board = Array(9).fill(null);

        const gameState = {
            board,
            player1: player1.id,
            player2: player2.id,
            currentTurn: player1.id,
            symbols: { [player1.id]: 'X', [player2.id]: 'O' },
            isVsBot,
            channelId: interaction.channelId
        };
        activeGames.set(gameId, gameState);

        const embed = baseEmbed(
            '❌⭕ اكس اند او',
            `${player1} (X) ضد ${isVsBot ? '🤖 البوت' : player2} (O)\n\nدور: **${player1}**`
        );

        await interaction.reply({
            embeds: [embed],
            components: buildBoard(board, gameId)
        });

        // إذا كان اللاعب الأول هو البوت (نادرًا) لن يحدث هنا لأن X دائمًا للاعب البشري أولاً
    }
};
