const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');

const ANSWERS = [
    'نعم، بالتأكيد ✅', 'اكيد 100%', 'الاحتمال كبير', 'لا اعتقد ذلك',
    'لا ❌', 'اسأل مرة ثانية', 'غير واضح، حاول لاحقاً', 'بدون شك!',
    'مستحيل', 'ربما 🤔', 'التوقعات جيدة', 'لا تعتمد على هذا'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('الكرة-السحرية')
        .setDescription('اسأل الكرة السحرية اي سؤال')
        .addStringOption(opt => opt.setName('سؤال').setDescription('اكتب سؤالك').setRequired(true)),

    async execute(interaction) {
        const question = interaction.options.getString('سؤال');
        const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
        const embed = baseEmbed('🎱 الكرة السحرية', `**السؤال:** ${question}\n**الجواب:** ${answer}`);
        await interaction.reply({ embeds: [embed] });
    }
};
