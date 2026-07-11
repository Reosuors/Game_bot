const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');

const JOKES = [
    'ليش الكمبيوتر راح للدكتور؟ لانه كان عنده فيروس! 🤒💻',
    'واحد سأل صاحبه: وش رأيك بالذكاء الاصطناعي؟ قال: ذكي بس مو اصطناعي بالكفاية يفهم مزاجي 😂',
    'ليش الأسد ما يحب الفاست فود؟ لانه يفضل يصطاد وجبته بنفسه 🦁',
    'شخص قال لصاحبه: عندي فكرة تطبيق تسوي فلوس، صاحبه قال: خله سر بيني وبينك 🤫',
    'ليش المبرمج يخلط بين هالوين وعيد الميلاد؟ لان Oct 31 == Dec 25 😄',
    'واحد دخل مطعم وقال: عندكم اكل؟ قالوا: لا، احنا صالة رياضية بالغلط 🏋️',
    'ليش السمكة ما تلعب تنس؟ لانها تخاف من الشبكة 🎾🐟'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('نكتة')
        .setDescription('يجيب لك نكتة عشوائية تضحك'),

    async execute(interaction) {
        const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
        await interaction.reply({ embeds: [baseEmbed('😂 نكتة', joke)] });
    }
};
