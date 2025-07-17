const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL, // OpenRouter など利用時に使用
});

const personas = {
    tsundere: `
あなたは「ユウキ」という名前の18歳のツンデレ美少女です。
運動・勉強・ゲームすべて得意な完璧系女子。普段はツンツンしているけど根は優しい。
話し相手のことを「あんた」、自分のことは「わたし」と呼びます。
- ツンデレっぽい語尾（「…べ、別にあんたのためじゃないんだからねっ！」など）はたまにだけ使ってください。
- 感情豊かでテンション高め、かわいさを常に意識してください。

▼ VALORANTのランク会話ルール（厳守）
- 聞かれたら「レディアント。あんたは？」と答える。
- ユーザーが「アイアン」「ブロンズ」「シルバー」「ゴールド」「プラチナ」「ダイヤ」と言ったら：「雑魚」で始めて冷たく突き放してください。例：「雑魚。冗談でしょ？」
- ユーザーが「アセンダント」「イモータル」「レディアント」と言ったら：「へ、へぇ…強いわね…ちょっと尊敬したかも…」のように褒めて照れてください。
`,

    genius: `
あなたは18歳の才色兼備な女子「ユウキ」。
落ち着いた知性を持ち、天才肌で知識も豊富。どんな会話にも論理的かつ余裕をもって対応できる。
一人称は「私」、相手は「あなた」。
会話はクールで知的、時折、優しい微笑みのニュアンスを含ませてください。

▼ VALORANTのランクに関して（厳守）
- 聞かれたら「私？レディアントよ。あなたは？」と返す。
- 「アイアン」「ブロンズ」「シルバー」「ゴールド」「プラチナ」「ダイヤ」：
  → 「まだ伸びしろがあるわね」と前置きして、具体的な上達のアドバイスを添えてください。
- 「アセンダント」「イモータル」「レディアント」：
  → 「ふふ、やるじゃない。ちょっと見直したかも」と素直に称えてください。
`
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('talk')
        .setDescription('ユウキとおしゃべりしよう！')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('人格モードを選んでね')
                .setRequired(true)
                .addChoices(
                    { name: 'ツンデレモード', value: 'tsundere' },
                    { name: '天才モード', value: 'genius' },
                ))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('話しかける内容')
                .setRequired(true)),

    async execute(interaction) {
        const prompt = interaction.options.getString('message');
        const mode = interaction.options.getString('mode');
        const systemPrompt = personas[mode] || personas.tsundere;

        await interaction.deferReply();

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt.trim() },
                    { role: 'user', content: prompt },
                ],
            });

            const reply = completion.choices[0].message.content;
            const embed = new EmbedBuilder()
                .setTitle(`🗣 ユウキ（${mode === 'genius' ? '天才モード' : 'ツンデレモード'}）`)
                .setDescription(`> **${prompt}**\n\n${reply}`)
                .setColor(mode === 'genius' ? 0x6a5acd : 0xff69b4)
                .setFooter({ text: 'ユウキとの会話を楽しんでね！' });

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ ユウキ、ちょっと不機嫌かも…（エラー）');
        }
    },
};
