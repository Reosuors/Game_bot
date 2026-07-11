const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('نرد')
        .setDescription('ارمي نرد وشوف شنو رقمك')
        .addIntegerOption(opt =>
            opt.setName('عدد-النرد')
                .setDescription('كم نرد تريد ترمي؟ (1-5)')
                .setMinValue(1)
                .setMaxValue(5)
                .setRequired(false)
        ),

    async execute(interaction) {
        const count = interaction.options.getInteger('عدد-النرد') || 1;
        const diceEmojis = ['⚀','⚁','⚂','⚃','⚄','⚅'];
        const results = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
        const display = results.map(r => diceEmojis[r - 1]).join(' ');
        const total = results.reduce((a, b) => a + b, 0);

        const embed = baseEmbed('🎲 رمي النرد', `${display}\n\n**المجموع: ${total}**`);
        await interaction.reply({ embeds: [embed] });
    }
};
