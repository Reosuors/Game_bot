const { EmbedBuilder } = require('discord.js');

const COLORS = {
    primary: 0x5865F2,
    success: 0x57F287,
    danger: 0xED4245,
    warning: 0xFEE75C,
    dark: 0x2B2D31
};

function baseEmbed(title, description, color = COLORS.primary) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: '⚡ البوت الخارق' });
}

function successEmbed(title, description) {
    return baseEmbed(`✅ ${title}`, description, COLORS.success);
}

function errorEmbed(title, description) {
    return baseEmbed(`❌ ${title}`, description, COLORS.danger);
}

module.exports = { baseEmbed, successEmbed, errorEmbed, COLORS };
