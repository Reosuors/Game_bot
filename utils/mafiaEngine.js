const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { baseEmbed, COLORS } = require('./embeds');

const NIGHT_DURATION = 45000;
const DAY_VOTE_DURATION = 60000;

function alivePlayers(game) {
    return game.players.filter(p => game.alive[p]);
}

function buildTargetButtons(prefix, gameId, targets, client) {
    const rows = [];
    let row = new ActionRowBuilder();
    targets.forEach((id, i) => {
        if (i > 0 && i % 5 === 0) {
            rows.push(row);
            row = new ActionRowBuilder();
        }
        const user = client.users.cache.get(id);
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`${prefix}_${gameId}_${id}`)
                .setLabel(user ? user.username.slice(0, 20) : id)
                .setStyle(ButtonStyle.Danger)
        );
    });
    rows.push(row);
    return rows;
}

async function startNight(game, client, ROLES) {
    game.phase = 'night';
    game.nightActions = { mafiaVotes: {}, doctorSave: null, detectiveCheck: null };
    game.dayCount += 1;

    const channel = await client.channels.fetch(game.channelId);
    await channel.send({
        embeds: [baseEmbed('🌙 الليل حل...', 'المافيا يختارون ضحيتهم، الطبيب يحمي، المحقق يحقق...\nتحققوا من رسائلكم الخاصة (DM)!', COLORS.dark)]
    });

    const alive = alivePlayers(game);

    for (const playerId of alive) {
        const role = game.roles[playerId];
        const user = await client.users.fetch(playerId).catch(() => null);
        if (!user) continue;

        try {
            if (role === ROLES.MAFIA) {
                const targets = alive.filter(p => p !== playerId && game.roles[p] !== ROLES.MAFIA);
                await user.send({
                    embeds: [baseEmbed('🔪 دورك كمافيا', 'اختر ضحية هذه الليلة:')],
                    components: buildTargetButtons('mafiakill', game.gameId, targets, client)
                });
            } else if (role === ROLES.DOCTOR) {
                await user.send({
                    embeds: [baseEmbed('💉 دورك كطبيب', 'اختر شخص تريد حمايته الليلة (يمكنك اختيار نفسك):')],
                    components: buildTargetButtons('docsave', game.gameId, alive, client)
                });
            } else if (role === ROLES.DETECTIVE) {
                const targets = alive.filter(p => p !== playerId);
                await user.send({
                    embeds: [baseEmbed('🕵️ دورك كمحقق', 'اختر شخص تريد التحقيق معه:')],
                    components: buildTargetButtons('detcheck', game.gameId, targets, client)
                });
            }
        } catch {
            // المستخدم مغلق الخاص
        }
    }

    // ملاحظة: يتم جدولة انتهاء الليل من داخل interactionCreate.js عبر scheduleNightResolution
}

async function resolveNight(game, client, ROLES, checkWinCondition) {
    if (game.phase !== 'night') return;
    clearTimeout(game.nightTimeout);
    game.phase = 'resolving';

    const channel = await client.channels.fetch(game.channelId);
    const { mafiaVotes, doctorSave } = game.nightActions;

    // تحديد اكثر ضحية تصويتاً من المافيا
    let victim = null;
    if (Object.keys(mafiaVotes).length > 0) {
        const counts = {};
        Object.values(mafiaVotes).forEach(v => (counts[v] = (counts[v] || 0) + 1));
        victim = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }

    let resultText;
    if (victim && victim === doctorSave) {
        resultText = `😱 حاول المافيا قتل <@${victim}> لكن الطبيب انقذه في اللحظة الاخيرة! ✨`;
    } else if (victim) {
        game.alive[victim] = false;
        resultText = `💀 تم العثور على <@${victim}> ميتاً هذا الصباح.\nكان دوره: **${game.roles[victim]}**`;
    } else {
        resultText = '🌤️ مرت الليلة بسلام، لم يمت احد.';
    }

    await channel.send({ embeds: [baseEmbed('☀️ صباح جديد', resultText)] });

    const winner = checkWinCondition(game);
    if (winner) return endGame(game, client, winner);

    await startDay(game, client, ROLES, checkWinCondition);
}

async function startDay(game, client, ROLES, checkWinCondition) {
    game.phase = 'day';
    game.votes = {};

    const channel = await client.channels.fetch(game.channelId);
    const alive = alivePlayers(game);
    const list = alive.map(id => `<@${id}>`).join(' ، ');

    await channel.send({
        embeds: [baseEmbed('🗳️ وقت التصويت', `ناقشوا فيما بينكم ثم صوتوا لطرد المشتبه به!\n\n**الاحياء:** ${list}\n\nلديكم دقيقة للتصويت.`)],
        components: buildTargetButtons('mafiavote', game.gameId, alive, client)
    });

    // ملاحظة: يتم جدولة انتهاء النهار من داخل interactionCreate.js عبر scheduleDayResolutionIfNeeded
}

async function resolveDay(game, client, ROLES, checkWinCondition) {
    if (game.phase !== 'day') return;
    clearTimeout(game.dayTimeout);
    game.phase = 'resolving';

    const channel = await client.channels.fetch(game.channelId);
    const counts = {};
    Object.values(game.votes).forEach(v => (counts[v] = (counts[v] || 0) + 1));

    let resultText;
    if (Object.keys(counts).length > 0) {
        const [eliminated] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        game.alive[eliminated] = false;
        resultText = `⚖️ صوّت السيرفر على طرد <@${eliminated}>!\nكان دوره: **${game.roles[eliminated]}**`;
    } else {
        resultText = '🤷 ما حد صوت، ما طرد حد اليوم.';
    }

    await channel.send({ embeds: [baseEmbed('📢 نتيجة التصويت', resultText)] });

    const winner = checkWinCondition(game);
    if (winner) return endGame(game, client, winner);

    await startNight(game, client, ROLES);
}

async function endGame(game, client, winner) {
    const channel = await client.channels.fetch(game.channelId);
    const mafiaList = game.players.filter(p => game.roles[p] === 'مافيا 🔪').map(p => `<@${p}>`).join(', ');
    const winnerText = winner === 'mafia' ? '🔪 فاز فريق المافيا!' : '👨‍👩‍👧‍👦 فاز فريق المواطنين!';

    await channel.send({
        embeds: [baseEmbed('🏁 انتهت اللعبة!', `${winnerText}\n\nاعضاء المافيا كانوا: ${mafiaList || 'لا احد'}`, 0xFFD700)]
    });

    const mafiaCommand = require('../commands/games/mafia');
    mafiaCommand.activeGames.delete(game.channelId);
}

module.exports = {
    alivePlayers,
    buildTargetButtons,
    startNight,
    resolveNight,
    startDay,
    resolveDay,
    endGame,
    NIGHT_DURATION,
    DAY_VOTE_DURATION
};
