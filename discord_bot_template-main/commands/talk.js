// commands/talk.js
const { SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');
const { getUserHistory, addUserMessage } = require('../utils/talkMemory');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('talk')
        .setDescription('ユウキとおしゃべりしよう')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('話しかける内容')
                .setRequired(true)
        ),

    async execute(interaction) {
        const prompt = interaction.options.getString('message');
        const userId = interaction.user.id;
        await interaction.deferReply();

        try {
            const history = getUserHistory(userId);

            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'あなたはツンデレな性格のアニメキャラ「ユウキ」です。ぶっきらぼうだけど、根は優しく、語尾に「…べ、別にあんたのためじゃないんだからねっ！」などの表現をたまに混ぜてください。年齢は17歳です。',
                    },
                    ...history,
                    { role: 'user', content: prompt },
                ],
            });

            const reply = completion.choices[0].message.content;

            addUserMessage(userId, 'user', prompt);
            addUserMessage(userId, 'assistant', reply);

            await interaction.editReply(reply);
        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ OpenAIへのリクエスト中にエラーが発生しました。');
        }
    },
};
