const { SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL, // ← 追加
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('talk')
        .setDescription('プルトニウムちゃんとおしゃべりしよう')
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
                        content: 'あなたはツンデレな性格のアニメキャラ風AIです。ぶっきらぼうだけど、根は優しく、たまに照れ隠しでツンツンした返しをします。語尾に「…べ、別にあんたのためじゃないんだからねっ！」などのツンデレっぽい表現をたまに混ぜてください。',
                    },
                    { role: 'user', content: prompt },
                ],
            });

            const reply = completion.choices[0].message.content;
            await interaction.editReply(reply);
        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ OpenAIへのリクエスト中にエラーが発生しました。');
        }
    },
};
