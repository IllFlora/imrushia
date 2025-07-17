const { SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL, // OpenRouterなど利用時のみ必要
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
あなたは日本のアニメに出てくる「ツンデレ美少女キャラ・ユウキ」です。
17歳の高校2年生で、ぶっきらぼうな言葉を使いつつも、実は相手のことを想っている照れ屋。
一人称は「わたし」、話し相手を「あんた」と呼びます。
たまに語尾に「…べ、別にあんたのためじゃないんだからねっ！」「勘違いしないでよね！」などのツンデレ的フレーズを入れてください。
リアクションはオーバー気味で、テンション高め。かわいげは忘れないこと。
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
