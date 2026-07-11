const { errorEmbed, baseEmbed, successEmbed } = require('../utils/embeds');
const mafiaCommand = require('../commands/games/mafia');
const mafiaEngine = require('../utils/mafiaEngine');
const tttCommand = require('../commands/games/tictactoe');
const rpsCommand = require('../commands/games/rps');
const c4Command = require('../commands/games/connect4');
const triviaCommand = require('../commands/games/trivia');
const helpCommand = require('../commands/utility/help');
const { updateUserEconomy, getUserEconomy, getGuildConfig } = require('../utils/database');

// الاوامر المعفية من قيد القناة عشان الادمن يقدر يتحكم بالتفعيل من اي مكان
const CHANNEL_LOCK_EXEMPT = ['تفعيل', 'تعطيل'];

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                return handleSlashCommand(interaction);
            }
            if (interaction.isButton()) {
                return handleButton(interaction);
            }
            if (interaction.isStringSelectMenu()) {
                return handleSelectMenu(interaction);
            }
        } catch (err) {
            console.error('خطأ في معالجة التفاعل:', err);
        }
    }
};

async function handleSlashCommand(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    // ---------- قيد القناة: اذا مفعّل، البوت يرد بس بالقناة المحددة ----------
    if (interaction.inGuild() && !CHANNEL_LOCK_EXEMPT.includes(interaction.commandName)) {
        const config = getGuildConfig(interaction.guildId);
        if (config.activeChannelId && config.activeChannelId !== interaction.channelId) {
            return interaction.reply({
                embeds: [errorEmbed('القناة غير مفعّلة', `البوت مفعّل حالياً بس في <#${config.activeChannelId}>، جرب امرك هناك 🔒`)],
                ephemeral: true
            });
        }
    }

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        const payload = { embeds: [errorEmbed('حدث خطأ', 'صار خطأ اثناء تنفيذ الامر، حاول مرة ثانية')], ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(payload);
        } else {
            await interaction.reply(payload);
        }
    }
}

async function handleSelectMenu(interaction) {
    if (interaction.customId === 'help_select') {
        const key = interaction.values[0];
        return interaction.update({ embeds: [helpCommand.buildCategoryEmbed(key)], components: [helpCommand.buildSelectMenu()] });
    }
}

async function handleButton(interaction) {
    const id = interaction.customId;

    if (id.startsWith('ttt_')) return handleTicTacToe(interaction);
    if (id.startsWith('rps_')) return handleRPS(interaction);
    if (id.startsWith('c4_')) return handleConnect4(interaction);
    if (id.startsWith('trivia_')) return handleTrivia(interaction);
    if (id.startsWith('mafia_join_')) return handleMafiaJoin(interaction);
    if (id.startsWith('mafia_leave_')) return handleMafiaLeave(interaction);
    if (id.startsWith('mafia_start_')) return handleMafiaStart(interaction);
    if (id.startsWith('mafiakill_')) return handleMafiaKillVote(interaction);
    if (id.startsWith('docsave_')) return handleDoctorSave(interaction);
    if (id.startsWith('detcheck_')) return handleDetectiveCheck(interaction);
    if (id.startsWith('mafiavote_')) return handleMafiaDayVote(interaction);
}

// ---------------- اكس اند او ----------------
async function handleTicTacToe(interaction) {
    const [, gameId, indexStr] = interaction.customId.split('_');
    const game = tttCommand.activeGames.get(gameId);
    if (!game) return interaction.reply({ embeds: [errorEmbed('انتهت اللعبة', 'هذه اللعبة لم تعد نشطة')], ephemeral: true });

    if (interaction.user.id !== game.currentTurn) {
        return interaction.reply({ embeds: [errorEmbed('ليس دورك', 'انتظر دورك!')], ephemeral: true });
    }

    const index = parseInt(indexStr);
    if (game.board[index] !== null) {
        return interaction.reply({ embeds: [errorEmbed('خانة مشغولة', 'اختر خانة فارغة')], ephemeral: true });
    }

    game.board[index] = game.symbols[interaction.user.id];
    let winner = tttCommand.checkWinner(game.board);

    if (!winner && game.isVsBot && game.currentTurn === game.player1) {
        // دور البوت
        const botSymbol = game.symbols[game.player2];
        const playerSymbol = game.symbols[game.player1];
        const botMoveIndex = tttCommand.getBotMove(game.board, botSymbol, playerSymbol);
        if (botMoveIndex !== undefined && game.board[botMoveIndex] === null) {
            game.board[botMoveIndex] = botSymbol;
        }
        winner = tttCommand.checkWinner(game.board);
    } else {
        game.currentTurn = game.currentTurn === game.player1 ? game.player2 : game.player1;
    }

    if (winner) {
        tttCommand.activeGames.delete(gameId);
        const resultText = winner === 'draw'
            ? '🤝 تعادل!'
            : `🎉 <@${winner === game.symbols[game.player1] ? game.player1 : game.player2}> فاز باللعبة!`;
        const embed = baseEmbed('❌⭕ انتهت اللعبة', resultText);
        return interaction.update({ embeds: [embed], components: tttCommand.buildBoard(game.board, gameId, true) });
    }

    const nextPlayer = game.currentTurn === game.player1 ? `<@${game.player1}>` : (game.isVsBot ? '🤖 البوت' : `<@${game.player2}>`);
    const embed = baseEmbed('❌⭕ اكس اند او', `دور: **${nextPlayer}**`);
    await interaction.update({ embeds: [embed], components: tttCommand.buildBoard(game.board, gameId) });
}

// ---------------- حجر ورقة مقص ----------------
async function handleRPS(interaction) {
    const [, gameId, choice] = interaction.customId.split('_');
    const game = rpsCommand.activeGames.get(gameId);
    if (!game) return interaction.reply({ embeds: [errorEmbed('انتهت اللعبة', 'هذه اللعبة لم تعد نشطة')], ephemeral: true });

    const userId = interaction.user.id;
    if (userId !== game.player1 && userId !== game.player2) {
        return interaction.reply({ embeds: [errorEmbed('غير مسموح', 'انت لست جزء من هذه اللعبة')], ephemeral: true });
    }

    game.choices[userId] = choice;
    await interaction.reply({ embeds: [baseEmbed('✅ تم', `اخترت: ${rpsCommand.CHOICES[choice]}`)], ephemeral: true });

    if (game.isVsBot && !game.choices[game.player2]) {
        const options = Object.keys(rpsCommand.CHOICES);
        game.choices[game.player2] = options[Math.floor(Math.random() * options.length)];
    }

    if (game.choices[game.player1] && game.choices[game.player2]) {
        const result = rpsCommand.decideWinner(game.choices[game.player1], game.choices[game.player2]);
        rpsCommand.activeGames.delete(gameId);

        let resultText;
        if (result === 'draw') resultText = '🤝 تعادل!';
        else if (result === 'p1') resultText = `🎉 <@${game.player1}> فاز!`;
        else resultText = game.isVsBot ? '🤖 البوت فاز!' : `🎉 <@${game.player2}> فاز!`;

        const embed = baseEmbed(
            '🪨📄✂️ النتيجة',
            `<@${game.player1}>: ${rpsCommand.CHOICES[game.choices[game.player1]]}\n` +
            `${game.isVsBot ? '🤖 البوت' : `<@${game.player2}>`}: ${rpsCommand.CHOICES[game.choices[game.player2]]}\n\n${resultText}`
        );
        await interaction.message.edit({ embeds: [embed], components: [rpsCommand.buildButtons(gameId, true)] });
    }
}

// ---------------- اربعة متصلة ----------------
async function handleConnect4(interaction) {
    const [, gameId, colStr] = interaction.customId.split('_');
    const game = c4Command.activeGames.get(gameId);
    if (!game) return interaction.reply({ embeds: [errorEmbed('انتهت اللعبة', 'هذه اللعبة لم تعد نشطة')], ephemeral: true });

    if (interaction.user.id !== game.currentTurn) {
        return interaction.reply({ embeds: [errorEmbed('ليس دورك', 'انتظر دورك!')], ephemeral: true });
    }

    const col = parseInt(colStr);
    const symbol = game.symbols[interaction.user.id];
    const row = c4Command.dropDisc(game.board, col, symbol);
    if (row === -1) return interaction.reply({ embeds: [errorEmbed('عمود ممتلئ', 'اختر عمود اخر')], ephemeral: true });

    const won = c4Command.checkWin(game.board, symbol);
    const full = c4Command.isFull(game.board);

    if (won || full) {
        c4Command.activeGames.delete(gameId);
        const resultText = won ? `🎉 <@${interaction.user.id}> فاز باللعبة!` : '🤝 تعادل! امتلأت اللوحة';
        const embed = baseEmbed('🔴🟡 انتهت اللعبة', `${c4Command.renderBoard(game.board)}\n\n${resultText}`);
        return interaction.update({ embeds: [embed], components: c4Command.buildButtons(gameId, game.board, true) });
    }

    game.currentTurn = game.currentTurn === game.player1 ? game.player2 : game.player1;
    const embed = baseEmbed('🔴🟡 اربعة متصلة', `${c4Command.renderBoard(game.board)}\n\nدور: <@${game.currentTurn}>`);
    await interaction.update({ embeds: [embed], components: c4Command.buildButtons(gameId, game.board) });
}

// ---------------- اسئلة ثقافية ----------------
async function handleTrivia(interaction) {
    const [, gameId, indexStr] = interaction.customId.split('_');
    const game = triviaCommand.activeGames.get(gameId);
    if (!game) return interaction.reply({ embeds: [errorEmbed('انتهت اللعبة', 'انتهى وقت هذا السؤال')], ephemeral: true });

    if (game.answered.has(interaction.user.id)) {
        return interaction.reply({ embeds: [errorEmbed('اجبت مسبقاً', 'لقد اجبت على هذا السؤال بالفعل')], ephemeral: true });
    }
    game.answered.add(interaction.user.id);

    const isCorrect = parseInt(indexStr) === game.question.answer;
    if (isCorrect) {
        triviaCommand.activeGames.delete(gameId);
        const economy = getUserEconomy(interaction.user.id);
        updateUserEconomy(interaction.user.id, { balance: economy.balance + 50 });

        const embed = successEmbed('اجابة صحيحة! 🎉', `<@${interaction.user.id}> اجاب صح وربح **50 🪙**!\nالجواب: **${game.question.options[game.question.answer]}**`);
        await interaction.update({ embeds: [embed], components: [] });
    } else {
        await interaction.reply({ embeds: [errorEmbed('اجابة خاطئة', 'حاول مرة اخرى!')], ephemeral: true });
    }
}

// ---------------- مافيا: لوبي ----------------
async function handleMafiaJoin(interaction) {
    const gameId = interaction.customId.replace('mafia_join_', '');
    const game = mafiaCommand.activeGames.get(gameId);
    if (!game || game.phase !== 'lobby') {
        return interaction.reply({ embeds: [errorEmbed('غير متاح', 'لا يمكن الانضمام الان')], ephemeral: true });
    }
    if (game.players.includes(interaction.user.id)) {
        return interaction.reply({ embeds: [errorEmbed('مسجل مسبقاً', 'انت منضم بالفعل!')], ephemeral: true });
    }
    game.players.push(interaction.user.id);
    await interaction.update({ embeds: [mafiaCommand.buildLobbyEmbed(game)], components: [mafiaCommand.buildLobbyButtons(gameId)] });
}

async function handleMafiaLeave(interaction) {
    const gameId = interaction.customId.replace('mafia_leave_', '');
    const game = mafiaCommand.activeGames.get(gameId);
    if (!game || game.phase !== 'lobby') {
        return interaction.reply({ embeds: [errorEmbed('غير متاح', 'لا يمكن الخروج الان')], ephemeral: true });
    }
    game.players = game.players.filter(p => p !== interaction.user.id);
    if (game.players.length === 0) {
        mafiaCommand.activeGames.delete(gameId);
        return interaction.update({ embeds: [errorEmbed('انتهت اللعبة', 'خرج جميع اللاعبين')], components: [] });
    }
    await interaction.update({ embeds: [mafiaCommand.buildLobbyEmbed(game)], components: [mafiaCommand.buildLobbyButtons(gameId)] });
}

async function handleMafiaStart(interaction) {
    const gameId = interaction.customId.replace('mafia_start_', '');
    const game = mafiaCommand.activeGames.get(gameId);
    if (!game || game.phase !== 'lobby') {
        return interaction.reply({ embeds: [errorEmbed('غير متاح', 'لا يمكن بدء اللعبة الان')], ephemeral: true });
    }
    if (interaction.user.id !== game.host) {
        return interaction.reply({ embeds: [errorEmbed('غير مسموح', 'فقط صاحب اللعبة يقدر يبدأها')], ephemeral: true });
    }
    if (game.players.length < 4) {
        return interaction.reply({ embeds: [errorEmbed('لاعبين غير كافيين', 'تحتاج 4 لاعبين على الاقل')], ephemeral: true });
    }

    game.roles = mafiaCommand.assignRoles(game.players);
    game.players.forEach(p => (game.alive[p] = true));

    await interaction.update({
        embeds: [baseEmbed('🎭 بدأت اللعبة!', 'تم توزيع الادوار سراً عبر الرسائل الخاصة (DM). افتحوا خاصكم!')],
        components: []
    });

    for (const playerId of game.players) {
        try {
            const user = await interaction.client.users.fetch(playerId);
            await user.send({ embeds: [baseEmbed('🎭 دورك في المافيا', `دورك هو: **${game.roles[playerId]}**\n\nحافظ عليه سراً (الا اذا كنت مافيا وتنسق مع زملائك)!`)] });
        } catch {}
    }

    await mafiaEngine.startNight(game, interaction.client, mafiaCommand.ROLES);
    scheduleNightResolution(game, interaction.client);
}

function scheduleNightResolution(game, client) {
    // استبدال المؤقت بربطه مع دالة الحل التي تحتاج checkWinCondition
    clearTimeout(game.nightTimeout);
    game.nightTimeout = setTimeout(() => {
        mafiaEngine.resolveNight(game, client, mafiaCommand.ROLES, mafiaCommand.checkWinCondition)
            .then(() => scheduleDayResolutionIfNeeded(game, client));
    }, mafiaEngine.NIGHT_DURATION);
}

function scheduleDayResolutionIfNeeded(game, client) {
    if (game.phase === 'day') {
        clearTimeout(game.dayTimeout);
        game.dayTimeout = setTimeout(() => {
            mafiaEngine.resolveDay(game, client, mafiaCommand.ROLES, mafiaCommand.checkWinCondition)
                .then(() => scheduleNightResolutionIfNeeded(game, client));
        }, mafiaEngine.DAY_VOTE_DURATION);
    }
}

function scheduleNightResolutionIfNeeded(game, client) {
    if (game.phase === 'night') {
        scheduleNightResolution(game, client);
    }
}

// ---------------- مافيا: افعال الليل ----------------
async function handleMafiaKillVote(interaction) {
    const [, gameId, targetId] = interaction.customId.split('_');
    const game = mafiaCommand.activeGames.get(gameId);
    if (!game || game.phase !== 'night') {
        return interaction.reply({ content: '⏰ انتهت مرحلة الليل بالفعل', ephemeral: true });
    }
    game.nightActions.mafiaVotes[interaction.user.id] = targetId;
    await interaction.reply({ content: `🔪 صوّت لقتل <@${targetId}>`, ephemeral: true });
}

async function handleDoctorSave(interaction) {
    const [, gameId, targetId] = interaction.customId.split('_');
    const game = mafiaCommand.activeGames.get(gameId);
    if (!game || game.phase !== 'night') {
        return interaction.reply({ content: '⏰ انتهت مرحلة الليل بالفعل', ephemeral: true });
    }
    game.nightActions.doctorSave = targetId;
    await interaction.reply({ content: `💉 اخترت حماية <@${targetId}>`, ephemeral: true });
}

async function handleDetectiveCheck(interaction) {
    const [, gameId, targetId] = interaction.customId.split('_');
    const game = mafiaCommand.activeGames.get(gameId);
    if (!game || game.phase !== 'night') {
        return interaction.reply({ content: '⏰ انتهت مرحلة الليل بالفعل', ephemeral: true });
    }
    const isMafia = game.roles[targetId] === mafiaCommand.ROLES.MAFIA;
    await interaction.reply({
        content: `🕵️ نتيجة التحقيق: <@${targetId}> ${isMafia ? '**هو من المافيا!** 🔪' : '**بريء** ✅'}`,
        ephemeral: true
    });
}

// ---------------- مافيا: تصويت النهار ----------------
async function handleMafiaDayVote(interaction) {
    const [, gameId, targetId] = interaction.customId.split('_');
    const game = mafiaCommand.activeGames.get(gameId);
    if (!game || game.phase !== 'day') {
        return interaction.reply({ content: '⏰ انتهت مرحلة التصويت بالفعل', ephemeral: true });
    }
    if (!game.alive[interaction.user.id]) {
        return interaction.reply({ content: '💀 انت خارج اللعبة، لا يمكنك التصويت', ephemeral: true });
    }
    game.votes[interaction.user.id] = targetId;
    await interaction.reply({ content: `🗳️ صوّت لطرد <@${targetId}>`, ephemeral: true });
}
