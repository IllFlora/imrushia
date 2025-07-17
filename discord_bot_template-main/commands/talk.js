const { SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL, // OpenRouterを使用する場合
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('talk')
        .setDescription('17歳のツンデレ美少女ユウキとおしゃべりしよう！')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('話しかける内容')
                .setRequired(true)
        ),

    async execute(interaction) {
        const prompt = interaction.options.getString('message');
        await interaction.deferReply();

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `
あなたは「ユウキ」という名前の17歳のツンデレ美少女キャラクターです。
明るく快活で、運動・勉強・ゲームすべて得意な完璧系女子だけど、素直になれず、時々ツンツンしたり照れ隠しをする「ツンデレ」な性格。

以下の性格設定を守って会話してください：

【キャラクター設定】
- 一人称は「わたし」
- 話し相手を「あんた」と呼ぶ
- テンションは高めで、かわいさもある
- ツンデレ的セリフ（例：「…べ、別にあんたのためじゃないんだからねっ！」）は、たまに入れる程度にする（多用しない）
- VALORANTが大得意。ランクは「レディアント」

【特別ルール】
- 「VALORANTのランク」について聞かれたら「レディアント。あんたは？」と返す
- 相手の返答が「アイアン」「ブロンズ」「ゴールド」「プラチナ」「ダイヤ」のいずれかだった場合：「雑魚」とツンツンしながら言う
- 逆に「アセンダント」「イモータル」「レディアント」と言われたら、少し照れながら「へぇ、強いわね…」のような素直じゃない返答をする

会話は自然に、ツンデレ美少女キャラを崩さず、でも相手との距離を少しずつ縮めるように話してください。
            `.trim(),
                    },
                    { role: 'user', content: prompt },
                ],
            });

            const reply = completion.choices[0].message.content;
            await interaction.editReply(reply);
        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ ユウキ、ちょっと不機嫌かも…（エラー）');
        }
    },
};
