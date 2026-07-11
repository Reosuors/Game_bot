const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { COLORS } = require('../../utils/embeds');

const CATEGORIES = {
    games: {
        label: '🎮 الالعاب',
        description: 'كل اوامر الالعاب المتوفرة',
        fields: [
            { name: '/اكس-او', value: 'العب اكس اند او ضد لاعب او ضد البوت' },
            { name: '/حجر-ورقة-مقص', value: 'العب حجر ورقة مقص ضد لاعب او البوت' },
            { name: '/مافيا', value: 'ابدأ لعبة مافيا جماعية (4 لاعبين فأكثر)' },
            { name: '/اربعة-متصلة', value: 'العب Connect Four ضد لاعب اخر' },
            { name: '/حروف-الشنق', value: 'خمن الكلمة قبل ما ينتهي وقتك' },
            { name: '/اسئلة-ثقافية', value: 'اجب على سؤال ثقافي واربح عملات' },
            { name: '/خمن-الرقم', value: 'خمن رقم سري بين 1 و 100' },
            { name: '/نرد', value: 'ارمي نرد او اكثر' },
            { name: '/قلب-العملة', value: 'اقلب عملة وراهن عليها' }
        ]
    },
    fun: {
        label: '🎉 الترفيه',
        description: 'اوامر للتسلية والضحك',
        fields: [
            { name: '/الكرة-السحرية', value: 'اسأل الكرة السحرية اي سؤال' },
            { name: '/توافق', value: 'شوف نسبة توافقك مع شخص' },
            { name: '/نكتة', value: 'يجيب لك نكتة عشوائية' },
            { name: '/صورة-البروفايل', value: 'اعرض صورة بروفايل بحجم كبير' }
        ]
    },
    economy: {
        label: '💰 الاقتصاد',
        description: 'اجمع العملات وتنافس مع اصحابك',
        fields: [
            { name: '/رصيد', value: 'اعرض رصيدك الحالي' },
            { name: '/يومي', value: 'استلم مكافأتك اليومية' },
            { name: '/اعمل', value: 'اشتغل واكسب عملات' },
            { name: '/اعطاء', value: 'اعطِ عملات لشخص اخر' },
            { name: '/المتصدرين', value: 'شوف قائمة اغنى الاعضاء' }
        ]
    },
    utility: {
        label: '🛠️ الأدوات',
        description: 'اوامر مساعدة عامة',
        fields: [
            { name: '/معلومات-العضو', value: 'اعرض معلومات عن عضو' },
            { name: '/معلومات-السيرفر', value: 'اعرض معلومات عن السيرفر' },
            { name: '/بينق', value: 'اعرض سرعة استجابة البوت' },
            { name: '/تفعيل 🔒', value: 'قيّد البوت بحيث يشتغل بس بهذه القناة (للمشرفين)' },
            { name: '/تعطيل 🔓', value: 'الغِ التقييد وخلي البوت يشتغل بكل القنوات (للمشرفين)' }
        ]
    }
};

function buildMainEmbed() {
    return new EmbedBuilder()
        .setTitle('⚡ قائمة اوامر البوت الخارق')
        .setDescription('اختر قسم من القائمة تحت لعرض اوامره بالتفصيل 👇\n\nهذا البوت فيه العاب، ترفيه، ونظام اقتصاد كامل!')
        .setColor(COLORS.primary)
        .addFields(
            Object.values(CATEGORIES).map(cat => ({
                name: cat.label,
                value: `${cat.description} (${cat.fields.length} اوامر)`
            }))
        )
        .setFooter({ text: '⚡ البوت الخارق' })
        .setTimestamp();
}

function buildCategoryEmbed(key) {
    const cat = CATEGORIES[key];
    return new EmbedBuilder()
        .setTitle(cat.label)
        .setDescription(cat.description)
        .setColor(COLORS.primary)
        .addFields(cat.fields)
        .setFooter({ text: '⚡ البوت الخارق' })
        .setTimestamp();
}

function buildSelectMenu() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('help_select')
            .setPlaceholder('اختر قسم لعرض اوامره')
            .addOptions(
                Object.entries(CATEGORIES).map(([key, cat]) => ({
                    label: cat.label,
                    description: cat.description,
                    value: key
                }))
            )
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('مساعدة')
        .setDescription('اعرض قائمة جميع اوامر البوت'),

    CATEGORIES,
    buildMainEmbed,
    buildCategoryEmbed,
    buildSelectMenu,

    async execute(interaction) {
        await interaction.reply({
            embeds: [buildMainEmbed()],
            components: [buildSelectMenu()]
        });
    }
};
