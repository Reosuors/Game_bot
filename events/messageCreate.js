const { baseEmbed, successEmbed, errorEmbed } = require('../utils/embeds');
const hangmanCommand = require('../commands/games/hangman');
const guessNumberCommand = require('../commands/games/guessnumber');
const { getUserLevel, updateUserLevel, getUserEconomy, updateUserEconomy } = require('../utils/database');

const XP_COOLDOWN = 60000;

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        await handleXP(message);

        if (message.guildId) {
            await handleHangmanGuess(message);
            await handleNumberGuess(message);
        }
    }
};

async function handleXP(message) {
    const level = getUserLevel(message.author.id);
    const now = Date.now();
    if (now - level.lastMessage < XP_COOLDOWN) return;

    const gainedXp = Math.floor(Math.random() * 10) + 5;
    const newXp = level.xp + gainedXp;
    const xpNeeded = level.level * 100;

    if (newXp >= xpNeeded) {
        updateUserLevel(message.author.id, { xp: newXp - xpNeeded, level: level.level + 1, lastMessage: now });
        const economy = getUserEconomy(message.author.id);
        updateUserEconomy(message.author.id, { balance: economy.balance + 50 });
        message.channel.send({
            embeds: [successEmbed('🎊 مستوى جديد!', `${message.author} وصل للمستوى **${level.level + 1}**! (مكافأة: 50 🪙)`)]
        }).catch(() => {});
    } else {
        updateUserLevel(message.author.id, { xp: newXp, lastMessage: now });
    }
}

async function handleHangmanGuess(message) {
    const game = hangmanCommand.activeGames.get(message.channelId);
    if (!game) return;

    const content = message.content.trim();
    if (content.length !== 1) return;

    const letter = content;
    if (game.guessed.includes(letter)) return;

    game.guessed.push(letter);

    if (!game.word.includes(letter)) {
        game.wrongGuesses += 1;
    }

    const masked = hangmanCommand.maskWord(game.word, game.guessed);
    const isWon = !masked.includes('⬜');
    const isLost = game.wrongGuesses >= game.maxWrong;

    if (isWon) {
        hangmanCommand.activeGames.delete(message.channelId);
        const economy = getUserEconomy(message.author.id);
        updateUserEconomy(message.author.id, { balance: economy.balance + 75 });
        return message.channel.send({
            embeds: [successEmbed('🎉 فزتم!', `الكلمة كانت: **${game.word}**\nمكافأة لـ ${message.author}: **75 🪙**`)]
        });
    }

    if (isLost) {
        hangmanCommand.activeGames.delete(message.channelId);
        return message.channel.send({
            embeds: [errorEmbed('💀 خسرتم!', `${hangmanCommand.HANGMAN_STAGES[game.wrongGuesses]}\nالكلمة كانت: **${game.word}**`)]
        });
    }

    await message.channel.send({
        embeds: [baseEmbed(
            '🔤 لعبة تخمين الكلمة',
            `${hangmanCommand.HANGMAN_STAGES[game.wrongGuesses]}\n**الكلمة:** ${masked}\n\nمحاولات متبقية: **${game.maxWrong - game.wrongGuesses}**\nحروف مستخدمة: ${game.guessed.join(', ')}`
        )]
    });
}

async function handleNumberGuess(message) {
    const game = guessNumberCommand.activeGames.get(message.channelId);
    if (!game) return;
    if (message.author.id !== game.player) return;

    const guess = parseInt(message.content.trim());
    if (isNaN(guess)) return;

    game.attempts += 1;
    const remaining = game.maxAttempts - game.attempts;

    if (guess === game.number) {
        guessNumberCommand.activeGames.delete(message.channelId);
        const reward = Math.max(10, (game.maxAttempts - game.attempts + 1) * 20);
        const economy = getUserEconomy(message.author.id);
        updateUserEconomy(message.author.id, { balance: economy.balance + reward });
        return message.channel.send({
            embeds: [successEmbed('🎉 صح!', `الرقم كان **${game.number}**! خمنته بـ ${game.attempts} محاولة\nمكافأة: **${reward} 🪙**`)]
        });
    }

    if (remaining <= 0) {
        guessNumberCommand.activeGames.delete(message.channelId);
        return message.channel.send({
            embeds: [errorEmbed('😢 خسرت!', `انتهت محاولاتك، الرقم كان **${game.number}**`)]
        });
    }

    const hint = guess < game.number ? '📈 اكبر من هذا' : '📉 اصغر من هذا';
    await message.channel.send({
        embeds: [baseEmbed('🔢 خمن الرقم', `${hint}\nمحاولات متبقية: **${remaining}**`)]
    });
}
