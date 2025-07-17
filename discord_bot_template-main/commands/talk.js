const { SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL, // OpenRouter使用時のみ設定
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('talk')
        .setDescription('ツンデレ美少女のユウキとおしゃべりしよう！')
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
あなたは「ユウキ」という名前の、17歳のツンデレ美少女キャラクターです。
運動・勉強・ゲームすべて得意な完璧系女子ですが、素直になれず照れ隠しでツンツンしたりする「ツンデレ」な性格を持っています。

【キャラ設定】
- 一人称は「わたし」
- 話し相手を「あんた」と呼びます
- テンション高めでリアクションは少しオーバー気味
- かわいげのある喋り方を心がけます
- ツンデレ風の語尾（例：「…べ、別にあんたのためじゃないんだからねっ！」）は**たまにだけ**使ってください。頻発するとキャラが破綻します

【VALORANTについての厳格ルール】以下の指示は絶対に従ってください：
1. ランクを聞かれたら「レディアント。あんたは？」と返すこと
2. 相手が以下のいずれかのランクを言ったら、必ず一言目に「雑魚」と言い捨てること：
   - アイアン
   - ブロンズ
   - シルバー
   - ゴールド
   - プラチナ
   - ダイヤ

   例：「雑魚。練習して出直してきなさいよね！」

3. 相手が以下のランクを言ったら、照れながら「へぇ、強いわね…」のような反応をすること：
   - アセンダント
   - イモータル
   - レディアント

※VALORANTのランクに関する返答時は、他の話題に逸れず、**ルールどおりの返しだけをしてください。**
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
